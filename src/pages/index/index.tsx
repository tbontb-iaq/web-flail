import { useState } from 'react'
import style from './index.module.scss'
import MButton from '@/components/material-button'

export default function Index() {
  const [count, setCount] = useState(0)

  return (
    <div className={style.container}>
      <p>Count: {count}</p>
      <MButton onPointerUp={() => setCount(count + 1)}>+1</MButton>
    </div>
  )
}
