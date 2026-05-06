import type { GroupId } from '@/types/game.types'
import { MEDIA_ASSETS } from '@/utils/mediaAssets'
import styles from './GroupCard.module.css'

const ASSETS = {
  frame: '/img/01.png',
  texture: MEDIA_ASSETS.groupCard.texture,
  header: '/img/03(header).png',
  logo: '/img/brasao dc.png',
}

const GROUP_EMBLEMS: Record<GroupId, string> = {
  A: '/img/brasao-groupA.png',
  B: '/img/brasao-groupB.png',
}

interface GroupCardProps {
  group: GroupId
  activeGroup: GroupId | null
  activeSlot?: number
  statusOverride?: string
}

function getStatus(group: GroupId, activeGroup: GroupId | null) {
  if (!activeGroup) return 'AGUARDANDO'
  return activeGroup === group ? 'COM A PALAVRA' : 'BLOQUEADO'
}

function assetLayer(className: string, src: string, alt = '', fallbackSrc?: string) {
  return (
    <div className={`${styles.cardLayer} ${styles.cropLayer} ${className}`} aria-hidden="true">
      <img
        src={src}
        alt={alt}
        draggable="false"
        onError={(event) => {
          if (!fallbackSrc) return
          event.currentTarget.onerror = null
          event.currentTarget.src = fallbackSrc
        }}
      />
    </div>
  )
}

export function GroupCard({ group, activeGroup, activeSlot = 1, statusOverride }: GroupCardProps) {
  const mirrored = group === 'B'
  const status = statusOverride ?? getStatus(group, activeGroup)
  const numbers = [1, 2, 3, 4, 5]

  return (
    <article
      className={`${styles.card} ${mirrored ? `${styles.groupB} ${styles.mirrored}` : ''}`}
      data-group={group}
      data-active={activeGroup === group ? 'true' : 'false'}
      aria-label={`GRUPO ${group}`}
    >
      {assetLayer(styles.textureLayer, ASSETS.texture)}
      {assetLayer(styles.headerLayer, ASSETS.header)}
      <h2 className={styles.titleText}>GRUPO {group}</h2>

      <div className={styles.halftone} aria-hidden="true" />
      {assetLayer(styles.emblemLayer, GROUP_EMBLEMS[group], `Brasao do Grupo ${group}`, '/img/04(brasao).png')}

      <div className={styles.playerSlots}>
        {numbers.map((number) => (
          <div
            className={`${styles.playerSlot} ${number === activeSlot ? styles.isActive : ''}`}
            key={number}
            aria-label={`GRUPO ${group} jogador ${number}`}
          >
            <span className={styles.slotNumber}>{number}</span>
            <span className={styles.playerName}>JOGADOR</span>
          </div>
        ))}
      </div>

      <div className={styles.statusPanel}>
        <div className={styles.statusLabel}>STATUS</div>
        <div className={styles.statusValue}>{status}</div>
      </div>

      <div className={styles.logoArea} aria-hidden="true">
        <img src={ASSETS.logo} alt="" draggable="false" />
      </div>

      {assetLayer(styles.frameLayer, ASSETS.frame)}
    </article>
  )
}
