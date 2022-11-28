import { format } from 'date-fns';

export default function ContainersTab({ containers }) {
	return (
		<table width="100%">
			<thead>
				<tr>
					<th width="180">Docker container id</th>
					<th>Time added</th>
					<th>Link</th>
				</tr>
			</thead>
			<tbody>
				{containers.map((row) => {
					if (row.version !== 'latest') {
						return (
							<tr key={row.version}>
								<td align="center">{row.version}</td>
								<td align="center">
									{format(
										new Date(row.addedTime),
										'd MMMM yyyy, HH:mm',
										{
											timeZone: 'UTC',
										}
									)}
								</td>
								<td align="center">
									<a href={row.commitLink}>github</a>
								</td>
							</tr>
						);
					}
				})}
			</tbody>
		</table>
	);
}
