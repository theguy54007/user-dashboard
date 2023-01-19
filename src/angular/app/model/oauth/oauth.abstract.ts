
const SourceTypes = ['fb', 'google'] as const
type SourceType = typeof SourceTypes[number]

export abstract class OauthAbstract{
  source: SourceType
}
