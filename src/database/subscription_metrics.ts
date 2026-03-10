import { find } from 'lodash';

import { connection, transact } from './index';
import { rowsFromRaw } from './raw-results';
import redis from '../redis';
import { logger } from '../logger';

type SubscriptionMetricCacheRow = {
	subscriptionName: string;
	hour: string;
	sampledSessions: number;
	completedSessions: number;
	estimatedSubscriptions: number;
	transportedEvents: number;
	sessionDurationMs: number;
};

const subscriptionMetricModel = {
	timer: null,
	internalCache: [] as SubscriptionMetricCacheRow[],
	SAVE_INTERVAL_MS: 30 * 1000,
	DELETE_INTERVAL_MS: 5 * 60 * 1000,
	MAX_RETENTION_DAYS: 5,

	init: function () {
		logger.info('starting subscription metric memory-to-db synchronizer');
		subscriptionMetricModel.timer = setInterval(
			subscriptionMetricModel.syncToDb,
			subscriptionMetricModel.SAVE_INTERVAL_MS
		);

		logger.info('starting subscription metric periodic cleanup from db');
		setInterval(async () => {
			const now = Date.now();
			await subscriptionMetricModel.deleteOlderThan(
				now - subscriptionMetricModel.MAX_RETENTION_DAYS * 24 * 3600 * 1000
			);
		}, subscriptionMetricModel.DELETE_INTERVAL_MS);
	},

	syncToDb: async function () {
		for (const row of subscriptionMetricModel.internalCache) {
			await subscriptionMetricModel.storeInDb(row);
		}

		subscriptionMetricModel.internalCache = [];
	},

	add: async function ({
		subscriptionName,
		hour,
		sampledSessions = 0,
		completedSessions = 0,
		estimatedSubscriptions = 0,
		transportedEvents = 0,
		sessionDurationMs = 0,
	}: {
		subscriptionName: string;
		hour: string;
		sampledSessions?: number;
		completedSessions?: number;
		estimatedSubscriptions?: number;
		transportedEvents?: number;
		sessionDurationMs?: number;
	}) {
		const row = find(subscriptionMetricModel.internalCache, {
			subscriptionName,
			hour,
		});

		if (row) {
			row.sampledSessions += sampledSessions;
			row.completedSessions += completedSessions;
			row.estimatedSubscriptions += estimatedSubscriptions;
			row.transportedEvents += transportedEvents;
			row.sessionDurationMs += sessionDurationMs;
			return;
		}

		subscriptionMetricModel.internalCache.push({
			subscriptionName,
			hour,
			sampledSessions,
			completedSessions,
			estimatedSubscriptions,
			transportedEvents,
			sessionDurationMs,
		});
	},

	storeInDb: async function ({
		subscriptionName,
		hour,
		sampledSessions,
		completedSessions,
		estimatedSubscriptions,
		transportedEvents,
		sessionDurationMs,
	}: SubscriptionMetricCacheRow) {
		await transact(async (trx) => {
			const existingCount = (
				await trx('subscription_metric_hourly')
					.count('subscription_name', { as: 'cnt' })
					.where({
						subscription_name: subscriptionName,
						hour,
					})
			)[0].cnt;

			if (existingCount > 0) {
				await trx('subscription_metric_hourly')
					.where({
						subscription_name: subscriptionName,
						hour,
					})
					.update({
						sampled_sessions: trx.raw('sampled_sessions + ?', [sampledSessions]),
						completed_sessions: trx.raw('completed_sessions + ?', [
							completedSessions,
						]),
						estimated_subscriptions: trx.raw('estimated_subscriptions + ?', [
							estimatedSubscriptions,
						]),
						transported_events: trx.raw('transported_events + ?', [
							transportedEvents,
						]),
						session_duration_ms: trx.raw('session_duration_ms + ?', [
							sessionDurationMs,
						]),
						updated_time: new Date(),
					});
			} else {
				await trx('subscription_metric_hourly')
					.insert({
						subscription_name: subscriptionName,
						hour,
						sampled_sessions: sampledSessions,
						completed_sessions: completedSessions,
						estimated_subscriptions: estimatedSubscriptions,
						transported_events: transportedEvents,
						session_duration_ms: sessionDurationMs,
						updated_time: new Date(),
					})
					.onConflict(['subscription_name', 'hour'])
					.ignore();
			}
		});
	},

	getHits: async function ({
		granularity = 'HOUR',
		hours = 24,
	}: {
		granularity?: 'DAY' | 'HOUR';
		hours?: number;
	}) {
		const sanitizedHours = Number.isFinite(hours)
			? Math.max(1, Math.min(24 * 30, Math.floor(hours)))
			: 24;

		const cacheKey = `subscription_metrics.${granularity}.${sanitizedHours}`;
		const cachedResults = await redis.get(cacheKey);
		if (cachedResults) {
			return JSON.parse(cachedResults);
		}

		const results =
			granularity === 'HOUR'
				? await connection.raw(
						`SELECT subscription_name as "subscriptionName",
								TO_CHAR(hour, 'YYYY-MM-DD"T"HH24:00:00"Z"') as bucket,
								SUM(sampled_sessions)::int as "sampledSessions",
								SUM(completed_sessions)::int as "completedSessions",
								ROUND(SUM(estimated_subscriptions)::numeric, 2)::float as "estimatedSubscriptions",
								SUM(transported_events)::int as "transportedEvents",
								ROUND(
									CASE WHEN SUM(completed_sessions) > 0
										THEN (SUM(session_duration_ms)::numeric / SUM(completed_sessions)) / 1000
										ELSE 0
									END,
									2
								)::float as "avgSessionDurationSec",
								ROUND(
									CASE WHEN SUM(completed_sessions) > 0
										THEN SUM(transported_events)::numeric / SUM(completed_sessions)
										ELSE 0
									END,
									2
								)::float as "avgEventsPerSession"
						 FROM subscription_metric_hourly
						 WHERE hour >= NOW() - (? || ' hour')::interval
						 GROUP BY subscription_name, hour
						 ORDER BY hour, subscription_name`,
						[sanitizedHours]
					)
				: await connection.raw(
						`SELECT subscription_name as "subscriptionName",
								TO_CHAR(DATE_TRUNC('day', hour), 'YYYY-MM-DD') as bucket,
								SUM(sampled_sessions)::int as "sampledSessions",
								SUM(completed_sessions)::int as "completedSessions",
								ROUND(SUM(estimated_subscriptions)::numeric, 2)::float as "estimatedSubscriptions",
								SUM(transported_events)::int as "transportedEvents",
								ROUND(
									CASE WHEN SUM(completed_sessions) > 0
										THEN (SUM(session_duration_ms)::numeric / SUM(completed_sessions)) / 1000
										ELSE 0
									END,
									2
								)::float as "avgSessionDurationSec",
								ROUND(
									CASE WHEN SUM(completed_sessions) > 0
										THEN SUM(transported_events)::numeric / SUM(completed_sessions)
										ELSE 0
									END,
									2
								)::float as "avgEventsPerSession"
						 FROM subscription_metric_hourly
						 WHERE hour >= NOW() - (? || ' hour')::interval
						 GROUP BY subscription_name, DATE_TRUNC('day', hour)
						 ORDER BY DATE_TRUNC('day', hour), subscription_name`,
						[sanitizedHours]
					);

		const rows = rowsFromRaw(results);
		await redis.set(cacheKey, JSON.stringify(rows), 60);
		return rows;
	},

	deleteOlderThan: async function (timestampMs: number) {
		const hourFormatted = new Date(timestampMs).toISOString();
		await connection.raw(
			`DELETE FROM subscription_metric_hourly WHERE hour < ?`,
			[hourFormatted]
		);
	},
};

export default subscriptionMetricModel;
