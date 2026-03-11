import express    from 'express'
import cors       from 'cors'
import dotenv     from 'dotenv'
import analyzeRouter from './routes/analyze.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', analyzeRouter)

app.get('/health', (_req, res) => {
  res.json({
    status:  'online',
    ai:      'grok-beta',
    service: 'SentinelAI',
  })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`SentinelAI AI Server running on port ${PORT}`)
})
