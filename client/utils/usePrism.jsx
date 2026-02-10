import { useRef, useLayoutEffect } from 'react';
import Prism from 'prismjs';

function usePrism(code) {
	const ref = useRef();

	useLayoutEffect(() => {
		if (code && ref.current) {
			Prism.highlightElement(ref.current);
		}
	}, [code]);

	return code ? (
		<pre>
			<code ref={ref} className="language-graphql">
				{code.trim()}
			</code>
		</pre>
	) : null;
}

export default usePrism;
