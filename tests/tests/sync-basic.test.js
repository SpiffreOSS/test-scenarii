
const { createTestChainSync, setChainProps } = require('../../dist/test-scenarii.esm.js')
const { wait } = require('./utils.js')


describe(`Synchronous Chains`, () =>
{
	describe(`Basic Use`, () =>
	{
		test(`Running a test step with empty context and prop objects`, () =>
		{
			const testChain = createTestChainSync({}, {})

			testChain(

				(ctx, props) =>
				{
					// Do nothing
				},

				// Actual context and prop checking
				(ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test(`Running a test step with null context and prop objects`, () =>
		{
			const testChain = createTestChainSync(null, null)
			
			testChain(

				(ctx, props) =>
				{
					// Do nothing
				},

				// Actual context and prop checking
				(ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test(`Running a test step with undefined context and prop objects`, () =>
		{
			const testChain = createTestChainSync(undefined, undefined)
			
			testChain(

				(ctx, props) =>
				{
					// Do nothing
				},

				// Actual context and prop checking
				(ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test(`Running a test step with undefined context and prop objects, and a prop update from a test step`, () =>
		{
			const testChain = createTestChainSync()

			testChain(
				(ctx, props) => ({ initialized : true }),
				(ctx, props) => expect(props.initialized).toBe(true)
			)
		})

		test(`Running a test step with undefined context and prop objects, and a prop update from setChainProps`, () =>
		{
			const testChain = createTestChainSync()

			testChain(
				(ctx, props) => ({ initialized : true }),
				(ctx, props) => expect(props.initialized).toBe(true)
			)
		})

		test(`Running a test chain with null test steps`, () =>
		{
			const testChain = createTestChainSync(null, { count : 0 })
			
			testChain(
				null,
				null,
				(ctx, props) => ({ count : props.count + 1 }),
				null,
				(ctx, props) => expect(props.count).toBe(1)
			)
		})

		test(`Running a test step with actual context and prop objects`, () =>
		{
			const testChain = createTestChainSync({ contextStuff : 'Some context stuff' }, { propStuff : 'Some prop stuff' })
			
			testChain(
				(ctx, props) =>
				{
					expect(props).toMatchObject({ propStuff : 'Some prop stuff' })
					expect(Object.keys(props)).toHaveLength(1)

					expect(ctx).toMatchObject({ contextStuff : 'Some context stuff' })
					expect(Object.keys(ctx)).toHaveLength(1)
				}
			)
		})

		test(`Updating prop`, () =>
		{
			const testChain = createTestChainSync({}, { propStuff : 'Some prop stuff' })
			
			testChain(
				(ctx, props) =>
				{
					return { propStuff : 'some other prop stuff' }
				},

				(ctx, props) =>
				{
					expect(props).toHaveProperty('propStuff', 'some other prop stuff')
				}
			)
		})
	})

	describe(`Error Handling`, () =>
	{
		test(`Using a test step which throws an error (anonymous function)`, () =>
		{
			const testChain = createTestChainSync()
			
			try
			{
				testChain(
					(ctx, props) =>
					{
						undefinedVariable + 5 // eslint-disable-line no-magic-numbers, no-undef
					}
				)
			}
			catch (error)
			{
				expect(error).toBeInstanceOf(Error)
				expect(error.message).toMatch('test-scenarii caught an error while attempting to run user-provided test step #0:')
			}
		})

		test(`Using a test step which throws an error (named function)`, () =>
		{
			const testChain = createTestChainSync()
			
			try
			{
				testChain(
					function doingSomethingReprehensible (ctx, props)
					{
						undefinedVariable + 5 // eslint-disable-line no-magic-numbers, no-undef
					}
				)
			}
			catch (error)
			{
				expect(error).toBeInstanceOf(Error)
				expect(error.message).toMatch('test-scenarii caught an error while attempting to run user-provided test step #0 "doingSomethingReprehensible":')
			}
		})

		test(`Using a test step with a non-null, non-function test step`, () =>
		{
			const testChain = createTestChainSync()

			try
			{
				testChain(
					undefined
				)
			}
			catch (error)
			{
				expect(error).toBeInstanceOf(Error)
				expect(error.message).toMatch('A test step must be either a function or null; received "undefined" as test step #0 instead')
			}
		})
	})
})

