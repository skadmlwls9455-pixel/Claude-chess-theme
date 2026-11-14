import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene'

// A 1-bit chess room: black ground, ivory type, and one hot red for the move that matters.
const { theme, problems } = makeColors({
  label: 'Endgame',
  only: 'dark',
  roles: { accent: '#ff1a2e', danger: '#ff5a1f', success: '#a9c29a', warning: '#d9b25f', pro: '#c9c0ad' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#000000',
        'surface-1': '#0a0a09',
        'surface-2': '#121211',
        'surface-3': '#181816',
        'text-primary': '#f2ead8',
        'text-secondary': '#c4bca9',
        'text-muted': '#989182',
      },
    },
    git: { added: '#d8dcc4', removed: '#ff1a2e', modified: '#989182' },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'endgame', glass: { blur: 0, tint: '#000000', opacity: 0.55 } },
}

async function apply($: EngineInterface) {
  const set = await $.theme.set(LOOK)
  const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

  if (unpainted !== undefined) {
    $.ui.toast(unpainted)
  }

  if (!set.isDrawn) {
    $.ui.status(set.reason)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await apply($)

    return next(e)
  })

  // A client that joins after the session started still gets the look.
  on('session.attach', async ($, e, next) => {
    const joined = await next(e)

    await apply($)

    return joined
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== 'endgame' || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="A dithered black-and-white chessboard seen from Black's side; the black knight has just captured on g3, marked in red as a brilliant move"
        isInteractive
      />
    )
  })
}
