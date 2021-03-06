
/**
 * Return an synchronous chain
 * @param {object} initialContext 
 * @param {object} initialProps 
 * @returns {function}
 */
export function createTestChain (initialContext, initialProps)
{
	/**
	 * Return an synchronous chain
	 * @param {...function} testSteps The list of test steps in the chain
	 * @returns {object} The final props, possibly updated by each test step
	 */
	return function testChain (...testSteps)
	{
		let testContext =
		{
			ctx : Object.freeze( initialContext || {} ),
			props : initialProps || {}
		}

		let testStepIndex = 0

		for (const testStep of testSteps)
		{
			// Check if the test step is volutarily not a function (perhaps the result of a conditional statement)
			if (testStep === null)
			{
				// testContext remains the same
				continue
			}

			// Handle error values of a test step
			if (typeof testStep !== 'function')
			{
				throw new Error(`A test step must be either a function or null; received "${testStep}" as test step #${testStepIndex} instead`)
			}

			// Run the test step
			try
			{
				// Execute the testStep and pass it the current ctx and the props
				const updatedProps = testStep(testContext.ctx, testContext.props)

				// If props have been returned from the test step, we merge the props before returning the testContext
				if (updatedProps)
				{
					const nextProps = { ...testContext.props, ...updatedProps }
					testContext = { ...testContext, props : nextProps }
				}

				// Otherwise, testContext remains the same
			}
			catch (error)
			{
				const testId = (testStep.name === '') ? `#${testStepIndex}` : `#${testStepIndex} "${testStep.name}"`
				error.message = `test-scenarii caught an error while attempting to run user-provided test step ${testId}:\n` + error.message

				// Re-throw the error in order to skip over the handling of the returned value
				throw error
			}

			testStepIndex++
		}

		// Return the final props just in case
		return testContext.props
	}
}

createTestChain.cached = function cachedTestChain (...testSteps)
{
	/**
	 * Context and props are inherited from the parent chain whenever the necachedsted chain is encountered, 
	 * in order to ensure they are up-to-date
	 * @param {object} ctx
	 * @param {object} props
	 * @returns {object} The updated props
	 */
	return (ctx, props) =>
	{
		/**
		 * Call createTestChain() to effectively create a test chain with the provided context and props
		 * and immediately execute it with the provided test steps
		 */
		return this(ctx, props)(...testSteps)
	}
}
