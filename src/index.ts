/**
 * @module tslint
 */
/**
 * This second comment is required until
 * https://github.com/christopherthielen/typedoc-plugin-external-module-name/issues/6 is resolved.
 */

import * as fs from 'fs'
import { IRuleFailureJson } from 'tslint'

import { defaultResultHandler } from './resultHandlers'

export interface IPluginConfig {
  /**
   * The path to the file generated by running `tslint --format json`.
   */
  lintResultsJsonPath: string
  /**
   * An optional function to handle TSLint results.
   * When there are no violations, `results` will be an empty array.
   * Otherwise, TSLint has reported violations.
   *
   * It is up to the caller to format each lint result
   * and call the appropriate Danger functions (e.g., `fail()`).
   *
   * See the `defaultResultHandler` in `src/resultHandlers.ts`
   * for the default implementation.
   */
  handleResults?(results: IRuleFailureJson[]): void
}

/**
 * Runs TSLint on a project's source code and reports results to Danger.
 *
 * * If there are any lint violations, Danger will fail the build and post results in a comment.
 * * If there are no lint violations, Danger will comment saying that TSLint passed.
 * * If the `config.lintResultsJsonPath` JSON file cannot be read, Danger will comment with a warning.
 *
 * @export
 * @param config The plugin config object.
 */
export default function tslint(config: IPluginConfig): void {
  /** Reads */
  const getLintResults = (path: string): IRuleFailureJson[] | null => {
    try {
      const fileContents = fs.readFileSync(path, 'utf8')
      return JSON.parse(fileContents)
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e)
      return null
    }
  }

  if (!config) {
    throw Error('Configuration not supplied')
  }

  const {
    lintResultsJsonPath,
    handleResults = defaultResultHandler,
  } = config

  if (!lintResultsJsonPath) {
    throw Error(`'lintResultsJsonPath' not supplied`)
  }

  const results = getLintResults(lintResultsJsonPath)
  if (results === null) {
    warn('Couldn\'t read TSLint results file')
  } else {
    handleResults(results)
  }
}
