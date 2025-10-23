import { readdirSync, lstatSync } from 'fs'

const runtimes = readdirSync('src').filter((runtime) => {
	try {
		return lstatSync(`src/${runtime}`).isDirectory()
	} catch {
		return false
	}
})

const frameworks = runtimes
	.flatMap((runtime) => {
		return readdirSync(`src/${runtime}`)
			.filter(
				(a) =>
					a.endsWith('.ts') || a.endsWith('.js') || !a.includes('.')
			)
			.map((a) =>
				a.includes('.')
					? `${runtime}/` + a.replace(/.(j|t)s$/, '')
					: `${runtime}/${a}/index`
			)
	})
	.filter((x) => x)
	.sort()

// Output as JSON for GitHub Actions
console.log(JSON.stringify(frameworks))
