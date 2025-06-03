// pages/index.tsx
import { Header } from '@/components'
import PollWidget from '@/components/integrations/pollwidget/PollWidget'
import PollWidgett from '@/components/integrations/pollwidget/PollWidgett'
import { NextPage } from 'next'

const Meni: NextPage = () => (
  <main style={{ fontFamily: 'system-ui' }}>
    <h1>Welcome to Meni Next.djs + TypeScript!</h1>
    <PollWidgett />
    {/* <PollWidget /> */}
  </main>
)

export default Meni
