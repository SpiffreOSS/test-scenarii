
import { updateContext } from './deprecated/utils.js'


export function createTestChain (initialProps)
{
	// Cache initialProps directly if it's an object
	const initialTestContext =
	{
		props : (typeof initialProps === 'object') ? initialProps : {}
	}

	// Return a chain
	return (...testSteps) =>
	{
		// If initialProps is a prop getter, call it at each run of the chain
		if (typeof initialProps === 'function')
		{
			initialTestContext.props = initialProps()
		}

		// Execute the test steps in series
		return testSteps.reduce( (testContext, testStep, testStepIndex) =>
		{
			// Update the context with the returned props, if any
			const handleReturnedValue = (returnedValue) =>
			{
				// If an object has been returned from the test step, we forward it as the next testContext
				if (typeof returnedValue === 'object')
				{
					return updateContext(testContext, { props : returnedValue })
				}
				// If nothing was returned from the test step, we forward the testContext
				return testContext
			}

			// Execute the test step
			try
			{
				const res = testStep(testContext)
				return handleReturnedValue(res)
			}
			catch (error)
			{
				error.message = `test-scenarii caught an error while attempting to run user-provided test step #${testStepIndex}: ` + error.message

				// Re-throw the error in order to skip over the handling of the returned value
				throw error
			}

		}, initialTestContext)
	}
}