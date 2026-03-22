import { formatTime } from '../utils/formatTime'

interface CooldownTimerProps {
  remainingSeconds: number
}

export function CooldownTimer({ remainingSeconds }: CooldownTimerProps) {
  return (
    <div className="hf-cooldown" role="status" aria-live="polite">
      ⏳ Retry in <span className="hf-cooldownTime">{formatTime(remainingSeconds)}</span>
    </div>
  )
}
