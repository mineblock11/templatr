import Placeholder from './placeholder'

export default interface TemplatrDefiner {
  name: string,
  author: string,
  // Use ./ if not specified
  src?: string,
  description: string,
  placeholders: Placeholder[],
}
