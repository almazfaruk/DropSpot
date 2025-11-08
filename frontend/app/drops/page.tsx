import React from 'react';

export default function DropsPage(): React.ReactElement {
	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Drops</h1>
			<p>This is the Drops page implemented as a classic (named) function component.</p>
			<ul className="list-disc pl-6 mt-4">
				<li>Example drop 1</li>
				<li>Example drop 2</li>
				<li>Example drop 3</li>
			</ul>
		</main>
	);
}