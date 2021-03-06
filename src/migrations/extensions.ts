import { Converter } from './abstract'

const extensionMap: { [k: string]: string } = {
  afk: 'bibliofile/afk',
  ban_messages: 'bibliofile/ban_messages',
  biblio_analytics: 'bibliofile/analytics',
  biblio_banks: 'bibliofile/banking',
  biblio_censor: 'bibliofile/censoring',
  biblio_cron_messages: 'bibliofile/cron',
  biblio_lists: 'bibliofile/lists',
  biblio_name_triggers: 'bibliofile/name_triggers',
  biblio_op: 'bibliofile/slash_op',
  biblio_tempban: 'bibliofile/tempban',
  DaPgroupManagement: 'dapersonmgn/groupmanagement',
  DaPVPBeta: 'dapersonmgn/combatmessages',
  dice: 'bibliofile/dice',
  gmt: 'xyz.wingysam.gmt',
  jemcount: 'bibliofile/countdown',
  lastseen: 'xyz.wingysam.lastseen',
  logviewer: 'bibliofile/logs',
  manpages: 'bibliofile/manpages',
  marcopolo: 'bibliofile/marcopolo',
  quests: 'bibliofile/quests',
  warnings: 'bibliofile/warnings',
  wingysam_repeat: 'xyz.wingysam.repeat',
  worldCommands: 'dapersonmgn/worldcommands'
}

const isRemoved = (id: string) => {
  return ['biblio_history', 'discord', 'biblio_storage'].includes(id)
}

function toNewId (id: string) {
  return extensionMap[id] || id
}

/**
 * Old: http://blockheadsfans.com/messagebot/extensions
 * New: https://github.com/Blockheads-Messagebot/Extensions/blob/master/extensions.json
 */
export class ExtensionsConverter implements Converter {
  id = 'extensions'

  supports (key: string) {
    return key === 'mb_extensions'
  }

  convert (_key: string, data: string): { key: string; data: string } {
    const ids = JSON.parse(data) as string[]
    const newIds = ids.filter(id => !isRemoved(id)).map(toNewId)
    return { key: 'autoload', data: JSON.stringify(newIds) }
  }
}

export function extensionsConverter ({ overwrite }: { overwrite: boolean }): [string[], string[]] {
  const worldIds = new Set(Array.from({ length: localStorage.length })
    .map((_, i) => localStorage.key(i)!)
    .filter(key => /\d$/.test(key))
    .map(key => key.replace(/.*?(\d+)$/, '$1')))

  const oldExtensions = JSON.parse(localStorage.getItem('mb_extensions') || '[]') as string[]
  const newIds = oldExtensions.filter(id => !isRemoved(id)).map(toNewId)

  const warnings: string[] = []
  for (const worldId of worldIds) {
    const key = `/${worldId}/extensions/autoload`
    if (localStorage.getItem(key) != null && !overwrite) {
      warnings.push('Not overwriting ' + key)
    } else {
      localStorage.setItem(key, JSON.stringify(newIds))
    }
  }
  return [['mb_extensions'], warnings]
}
