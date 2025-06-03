// pages/index.tsx
import PollWidgett from '@/components/integrations/pollwidget/PollWidgett'
import { NextPage } from 'next'

const Homee: NextPage = () => (
  <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
    <PollWidgett />
  </main>
)

export default Homee
