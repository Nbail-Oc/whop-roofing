import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { loadWhop } from '@whop/elements'
import { BrandingElement, Checkout, CheckoutElement, ExpressCheckoutElement, PaymentElement, Payments, WhopElements, usePayments, useWhop } from '@whop/elements-react'
import { site, services, plans } from '../site-config'

export const Route = createFileRoute('/')({ component: Home })

declare global {
  interface Window { whop?: { track: (event: string, properties?: Record<string, unknown>) => void } }
}

function track(event: string, properties?: Record<string, unknown>) {
  window.whop?.track(event, properties)
}

function Home() {
  const [modalPlan, setModalPlan] = useState<string | null>(null)
  const [estimateState, setEstimateState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [navRaised, setNavRaised] = useState(false)
  const navSentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = navSentinel.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => setNavRaised(!entry.isIntersecting), { rootMargin: '24px 0px 0px 0px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-track-service]')
    const seen = new WeakSet<Element>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target)
          track('service_viewed', { service: entry.target.getAttribute('data-track-service') })
        }
      })
    }, { threshold: 0.35 })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  async function submitEstimate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEstimateState('sending')
    setErrorMessage('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const payload = Object.fromEntries(form.entries())
    try {
      const response = await fetch('/api/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not send your request.')
      track('estimate_requested', { service: payload.service, postal_code: payload.postalCode })
      setEstimateState('sent')
      formElement.reset()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Please try again.')
      setEstimateState('error')
    }
  }

  function startDeposit() {
    track('deposit_started', { plan: plans.deposit.id || 'project-deposit' })
    setModalPlan('deposit')
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-ink">
      <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-[1100px] -translate-x-1/2 sm:top-4 sm:w-[calc(100%-3rem)]">
        <nav className={`flex items-center justify-between rounded-full border px-4 py-3 transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-6 ${navRaised ? 'border-ink/10 bg-white/85 shadow-[0_14px_48px_rgba(25,25,25,0.10)] backdrop-blur-xl' : 'border-transparent bg-transparent shadow-none'}`} aria-label="Main navigation">
          <a className="flex shrink-0 items-center gap-2.5" href="#top" aria-label={`${site.name} home`}>
            <BrandMark />
            <span className="whitespace-nowrap text-base font-semibold tracking-tight">{site.name}</span>
          </a>
          <div className="hidden shrink-0 items-center gap-3 md:flex lg:gap-7">
            {['Services', 'Process', 'Pricing', 'Contact'].map((item) => <a key={item} className="whitespace-nowrap text-sm text-ink/70 transition-colors duration-200 hover:text-ink" href={`#${item.toLowerCase()}`}>{item}</a>)}
          </div>
          <a className="shrink-0 whitespace-nowrap rounded-lg bg-ink px-3 py-2.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-ink/90 lg:px-5 lg:text-sm" href="#contact"><span className="hidden lg:inline">Request an estimate</span><span className="lg:hidden">Estimate</span></a>
          <button className="ml-3 rounded-full border border-ink/15 px-3 py-2 text-sm md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">Menu</button>
        </nav>
        {menuOpen && <div className="mt-3 grid gap-1 rounded-2xl border border-ink/10 bg-white/95 p-3 shadow-[0_14px_48px_rgba(25,25,25,0.10)] backdrop-blur-xl md:hidden">{['Services', 'Process', 'Pricing', 'Contact'].map((item) => <a key={item} className="px-3 py-2 text-sm" href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>)}</div>}
      </header>

      <section id="top" className="relative flex h-[100svh] min-h-[640px] flex-col items-center overflow-hidden">
        <div ref={navSentinel} className="absolute left-0 top-0 h-px w-full" aria-hidden="true" />
        <BoomerangVideoBg />
        <div className="relative z-10 flex w-full flex-col items-center px-4 pt-28 text-center sm:px-6 sm:pt-32 md:pt-36">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-ink/55">Roofing, done with care</p>
          <h1 className="max-w-5xl font-serif text-5xl font-normal leading-[1.04] tracking-[-0.055em] text-ink sm:text-6xl md:text-7xl lg:text-[6.25rem]">A roof built<br className="sm:hidden" /> to last.</h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/70 sm:mt-6 sm:max-w-md md:mt-8 md:text-base">{site.hero}</p>
          <a href="#contact" className="mt-6 rounded-lg bg-ink px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink/90 sm:mt-8 sm:px-8 sm:py-3.5">Request an estimate</a>
        </div>
        <div className="relative z-10 mt-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="border border-b-0 border-gray-200 bg-white/90 px-5 pt-8 pb-0 shadow-sm backdrop-blur-sm sm:px-8 sm:pt-12 md:px-12 md:pt-14">
            <div className="grid gap-6 md:grid-cols-2 md:gap-16">
              <div><p className="micro">WHAT DO WE DO?</p><h2 className="mt-3 font-serif text-2xl font-normal leading-tight tracking-tight sm:text-3xl md:text-3xl lg:text-4xl">Careful work.<br className="hidden sm:block" /> Lasting protection.</h2></div>
              <p className="self-end text-sm leading-relaxed text-ink/70 md:text-[15px]">From the first inspection to the final clean-up, our crew makes the next step clear and the work dependable. Start with an honest look at your roof.</p>
            </div>
            <div className="mt-6 h-px w-full bg-gray-200 sm:mt-8 md:mt-10" />
            <div className="grid gap-2 py-4 sm:grid-cols-3 sm:gap-3 sm:py-5">
              {['Clear recommendations', 'Connected project updates', 'Work backed by care'].map((label, i) => <a key={label} href="#process" className="group flex cursor-pointer items-center justify-between bg-[#F4F3F3] px-4 py-3.5 transition-all duration-200 hover:bg-[#eaeaea] sm:px-5 sm:py-4"><span className="text-sm"><span className="text-ink/40">0{i + 1}</span><span className="mx-2 text-ink/30">/</span><span className="font-medium">{label}</span></span><ArrowRight className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gray-700" /></a>)}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section-wrap pt-24 md:pt-32">
        <SectionIntro eyebrow="ROOFING SERVICES" title={<>Good work starts<br />with a closer look.</>} body="Whether a small leak needs attention or the roof has reached the end of its life, we make a clear plan for the home in front of us." />
        <div className="mt-12 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => <article data-track-service={service.key} key={service.key} className="bg-white p-7 sm:p-8 md:p-10">
            <p className="micro">0{i + 1} / {service.kicker}</p><h3 className="mt-4 font-serif text-3xl tracking-tight">{service.title}</h3><p className="mt-4 min-h-20 text-sm leading-relaxed text-ink/65">{service.description}</p><a href="#contact" className="mt-7 inline-flex items-center gap-2 text-sm font-medium">Talk through your roof <ArrowRight className="h-4 w-4" /></a>
          </article>)}
        </div>
      </section>

      <section id="process" className="section-wrap grid gap-10 border-t border-ink/10 py-24 md:grid-cols-[0.8fr_1.2fr] md:py-32">
        <div><p className="micro">A SIMPLE PROCESS</p><h2 className="mt-4 max-w-md font-serif text-4xl leading-tight tracking-tight sm:text-5xl">From first look to final invoice.</h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/65">You’ll know what we found, what the work costs, and what happens next before the crew gets started.</p></div>
        <ol className="divide-y divide-ink/15 border-y border-ink/15">
          {[['01', 'Inspect & explain', 'We document the roof’s condition and share a clear scope with photos and recommendations.'], ['02', 'Approve & schedule', 'Choose the work that fits. A $500 project deposit reserves your crew and start date.'], ['03', 'Build & settle up', 'We complete the agreed scope, walk through the results, and send your final invoice through Whop.']].map(([n, title, text]) => <li key={n} className="grid gap-3 py-6 sm:grid-cols-[60px_1fr] sm:py-8"><span className="font-serif text-2xl text-ink/40">{n}</span><div><h3 className="font-serif text-2xl">{title}</h3><p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/65">{text}</p></div></li>)}
        </ol>
      </section>

      <section id="pricing" className="section-wrap bg-[#F4F3F3] px-4 py-24 sm:px-6 md:px-8 md:py-32">
        <SectionIntro eyebrow="STRAIGHTFORWARD PRICING" title={<>Clear prices.<br />A clear next step.</>} body="Book a one-time inspection, reserve a project start with a $500 deposit, or choose the flat-rate repair visit. Your written scope confirms the full job price before work begins." />
        <div className="mt-12 grid gap-5 md:grid-cols-[1fr_1.08fr_1fr]">
          <PriceCard name="Roof inspection" price="$149" note="One-time · includes a written condition report" button="Book inspection" onClick={() => setModalPlan('inspection')} />
          <PriceCard name="Project deposit" price="$500" note="One-time · credited toward your approved scope" button="Start a project" onClick={startDeposit} featured />
          <PriceCard name={plans.flat.name} price={`$${plans.flat.price}`} note={`One-time · ${plans.flat.description}`} button="Book this service" onClick={() => setModalPlan('flat')} />
        </div>
        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-ink/55">Template pricing: confirm local rates, taxes, deposit terms, cancellation policy, and the exact work included before publishing. Financing options, if offered, depend on merchant approval, customer eligibility, and provider availability.</p>
      </section>

      <section id="financing" className="section-wrap grid gap-10 py-24 md:grid-cols-2 md:items-end md:py-32">
        <div><p className="micro">PAYMENT OPTIONS</p><h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Make room for the work your home needs.</h2></div>
        <div><p className="max-w-lg text-sm leading-relaxed text-ink/70">Ask us about available ways to pay for a larger roofing project. Whop checkout can display eligible payment options for approved merchants, based on the buyer, purchase, and provider availability.</p><a href="#contact" className="mt-6 inline-flex items-center gap-2 text-sm font-medium">Discuss payment options <ArrowRight className="h-4 w-4" /></a></div>
      </section>

      <section id="area" className="section-wrap border-t border-ink/10 py-20 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-center"><div><p className="micro">WHERE WE WORK</p><h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Close to home.</h2></div><div><p className="max-w-lg text-sm leading-relaxed text-ink/70">Proudly serving {site.area}. Not sure if your address is in range? Send your ZIP code and we’ll confirm availability.</p><p className="mt-5 text-sm font-medium">{site.area}</p></div></div>
      </section>

      <section id="reviews" className="section-wrap bg-[#F4F3F3] py-24 md:py-32">
        <SectionIntro eyebrow="BUILT ON TRUST" title={<>Work you can feel<br />good about.</>} body="A roofing project should come with clear communication and a clean job site. Replace these prompts with verified customer feedback before publishing." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">{site.reviewPrompts.map((item, index) => <blockquote key={item} className="border-t border-ink/20 pt-5"><p className="font-serif text-xl leading-snug">“{item}”</p><footer className="mt-6 text-xs uppercase tracking-[0.15em] text-ink/50">Verified customer review {index + 1}</footer></blockquote>)}</div>
        <div className="mt-14 grid gap-5 border-y border-ink/15 py-6 text-sm text-ink/70 sm:grid-cols-3"><p>Licensed & insured <span className="block text-xs">Add local license details</span></p><p>Workmanship warranty <span className="block text-xs">Add actual warranty terms</span></p><p>Local crew, clear scope <span className="block text-xs">Customize for your business</span></p></div>
      </section>

      <section id="contact" className="section-wrap grid gap-12 py-24 md:grid-cols-2 md:py-32">
        <div><p className="micro">REQUEST AN ESTIMATE</p><h2 className="mt-4 max-w-md font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Let’s take a look.</h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/65">Tell us a little about your roof. We’ll follow up to arrange an inspection and discuss the best next step.</p><p className="mt-8 text-sm text-ink/70">{site.phone}<br />{site.email}</p></div>
        <form className="grid gap-4" onSubmit={submitEstimate}>
          <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Name<input required name="name" autoComplete="name" className="field" /></label><label className="field-label">Email<input required type="email" name="email" autoComplete="email" className="field" /></label></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Phone<input name="phone" type="tel" autoComplete="tel" className="field" /></label><label className="field-label">ZIP code<input required name="postalCode" inputMode="numeric" autoComplete="postal-code" className="field" /></label></div>
          <label className="field-label">What do you need?<select required name="service" defaultValue="" className="field"><option value="" disabled>Select a service</option>{services.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}</select></label>
          <label className="field-label">A few details<textarea name="details" rows={3} className="field resize-y" placeholder="Tell us what you’ve noticed…" /></label>
          <label className="flex items-start gap-3 text-xs leading-relaxed text-ink/60"><input type="checkbox" required className="mt-0.5 accent-ink" />I agree to be contacted about this estimate request.</label>
          <button disabled={estimateState === 'sending'} className="w-fit rounded-lg bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink/90 disabled:opacity-50">{estimateState === 'sending' ? 'Sending…' : 'Send estimate request'}</button>
          {estimateState === 'sent' && <p role="status" className="text-sm">Thanks — your request has been received.</p>}{estimateState === 'error' && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
        </form>
      </section>

      <footer className="border-t border-ink/10 px-6 py-8 sm:px-10 md:px-14"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 text-xs text-ink/55 sm:flex-row"><span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span><span>Serving {site.area}</span></div></footer>

      {modalPlan && <CheckoutModal planType={modalPlan} onClose={() => setModalPlan(null)} />}
    </main>
  )
}

function PriceCard({ name, price, note, button, onClick, featured = false }: { name: string; price: string; note: string; button: string; onClick: () => void; featured?: boolean }) {
  return <button type="button" onClick={onClick} className={`group min-h-64 rounded-[1.5rem] bg-white p-1.5 text-left ring-1 ring-ink/5 transition-[transform,box-shadow,ring-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_64px_rgba(25,25,25,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink active:scale-[0.99] ${featured ? 'md:-translate-y-2 md:hover:-translate-y-3.5' : ''}`}><span className="flex h-full min-h-60 flex-col rounded-[calc(1.5rem-0.375rem)] bg-[#FDFCFA] p-6 sm:p-7"><span className="micro">{name}</span><span className="mt-5 font-serif text-4xl">{price}</span><span className="mt-2 text-xs leading-relaxed text-ink/60">{note}</span><span className="mt-auto flex items-center justify-between border-t border-ink/10 pt-5 text-sm font-medium">{button}<span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F3F3] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4 text-ink/65 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" /></span></span></span></button>
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body: string }) {
  return <div className="grid gap-5 md:grid-cols-2 md:items-end"><div><p className="micro">{eyebrow}</p><h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">{title}</h2></div><p className="max-w-lg text-sm leading-relaxed text-ink/65">{body}</p></div>
}

function BrandMark() {
  return <svg aria-hidden="true" className="h-6 w-6 text-ink" viewBox="0 0 256 256" fill="currentColor"><path d="M144 256 27.598 256 144 139.598Z"/><path d="M256 207.5 200 256V56H0L48 0h208Z"/><path d="M0 204.402V112l92.402 0Z"/></svg>
}

function BoomerangVideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<ImageBitmap[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const display = canvasRef.current
    if (!video || !display) return
    let captureId = 0
    let playbackId = 0
    let lastTime = -1
    let frameIndex = 0
    let direction = 1
    const buffer = document.createElement('canvas')
    const context = buffer.getContext('2d', { alpha: false })
    const output = display.getContext('2d', { alpha: false })
    const capture = async () => {
      if (video.readyState >= 2 && Math.abs(video.currentTime - lastTime) > 0.001) {
        lastTime = video.currentTime
        const width = Math.min(960, video.videoWidth || 960)
        const height = Math.round(width * (video.videoHeight / video.videoWidth))
        if (buffer.width !== width || buffer.height !== height) { buffer.width = width; buffer.height = height }
        context?.drawImage(video, 0, 0, width, height)
        try { framesRef.current.push(await createImageBitmap(buffer)) } catch { /* video remains visible if capture is unsupported */ }
      }
      if ('requestVideoFrameCallback' in video) captureId = video.requestVideoFrameCallback(() => { void capture() })
      else captureId = requestAnimationFrame(() => { void capture() })
    }
    const onEnded = () => {
      if ('cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(captureId)
      else cancelAnimationFrame(captureId)
      if (framesRef.current.length < 2) return
      setReady(true)
      let lastPaint = 0
      const play = (now: number) => {
        if (now - lastPaint >= 1000 / 30) {
          const frame = framesRef.current[frameIndex]
          if (frame && output) {
            if (display.width !== frame.width || display.height !== frame.height) { display.width = frame.width; display.height = frame.height }
            output.drawImage(frame, 0, 0)
          }
          frameIndex += direction
          if (frameIndex >= framesRef.current.length - 1) { frameIndex = framesRef.current.length - 1; direction = -1 }
          else if (frameIndex <= 0) { frameIndex = 0; direction = 1 }
          lastPaint = now
        }
        playbackId = requestAnimationFrame(play)
      }
      playbackId = requestAnimationFrame(play)
    }
    video.addEventListener('ended', onEnded)
    void video.play().then(() => { void capture() }).catch(() => undefined)
    return () => {
      video.removeEventListener('ended', onEnded)
      if ('cancelVideoFrameCallback' in video) video.cancelVideoFrameCallback(captureId)
      else cancelAnimationFrame(captureId)
      cancelAnimationFrame(playbackId)
      framesRef.current.forEach((frame) => frame.close())
      framesRef.current = []
    }
  }, [])

  return <div className="absolute inset-0 z-0 origin-top scale-[1.15] overflow-hidden" aria-hidden="true"><video ref={videoRef} src={site.heroVideo} muted playsInline preload="auto" crossOrigin="anonymous" className={`h-full w-full object-cover object-top ${ready ? 'hidden' : ''}`} /><canvas ref={canvasRef} className={`h-full w-full object-cover object-top ${ready ? '' : 'hidden'}`} /></div>
}

function CheckoutModal({ planType, onClose }: { planType: string; onClose: () => void }) {
  const plan = plans[planType as keyof typeof plans]
  const [depositPaid, setDepositPaid] = useState(false)
  const [depositPaymentId, setDepositPaymentId] = useState('')
  const [depositStatus, setDepositStatus] = useState('')
  const [walletMode, setWalletMode] = useState(false)
  async function verifyDeposit(paymentId: string) {
    setDepositStatus('Confirming your deposit with Whop…')
    try {
      const response = await fetch('/api/payment-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to verify the deposit.')
      if (result.status === 'not_project_deposit') throw new Error('That payment is not the configured project deposit.')
      if (result.status !== 'paid') throw new Error('Whop is still processing this payment. Please refresh this step in a moment.')
      setDepositPaymentId(paymentId)
      setDepositPaid(true)
      setDepositStatus('')
    } catch (error) {
      setDepositStatus(error instanceof Error ? error.message : 'Unable to verify the deposit.')
    }
  }
  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/45 p-4" role="dialog" aria-modal="true" aria-label={`${plan?.name || 'Payment'} checkout`}><div className="relative my-auto w-full max-w-xl border border-gray-200 bg-white p-5 shadow-xl sm:p-8"><button onClick={onClose} className="absolute right-4 top-4 rounded-full px-3 py-1 text-sm text-ink/60 hover:bg-[#F4F3F3]" aria-label="Close checkout">Close</button><p className="micro">SECURE CHECKOUT BY WHOP</p><h2 className="mt-3 max-w-sm font-serif text-3xl">{plan?.name || 'Choose a service'}</h2><p className="mt-2 text-sm text-ink/65">{plan ? `$${plan.price} · one-time` : 'Select this plan in the checkout below.'}</p>
      {plan?.id && !(planType === 'deposit' && depositPaid) ? <div className="mt-6 rounded-xl border border-ink/10 p-4"><div className="mb-4 flex gap-2 text-xs"><button className={`rounded-md px-3 py-2 ${!walletMode ? 'bg-ink text-white' : 'bg-[#F4F3F3]'}`} onClick={() => setWalletMode(false)}>Full checkout</button><button className={`rounded-md px-3 py-2 ${walletMode ? 'bg-ink text-white' : 'bg-[#F4F3F3]'}`} onClick={() => setWalletMode(true)}>Apple Pay / Google Pay</button></div><WhopElements elements={loadWhop()} appearance={{ theme: { appearance: 'light', grayColor: 'gray' } }}><Checkout plan={plan.id} returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/?checkout=complete`} onComplete={(result) => { if (planType === 'deposit' && result.result === 'payment') void verifyDeposit(result.paymentId) }}>{walletMode ? <ExpressCheckoutElement wallets={{ applePay: 'auto', googlePay: 'auto', payPal: 'never' }} /> : <CheckoutElement />}</Checkout></WhopElements>{depositStatus && <p role="status" className="mt-3 text-xs text-ink/70">{depositStatus}</p>}<div className="mt-3 rounded-lg bg-[#F4F3F3] p-4 text-xs leading-relaxed text-ink/65">Whop hosts the payment fields and checkout. Apple Pay and Google Pay appear when enabled for this merchant and verified for this domain. After Whop confirms a project deposit, you can securely save a payment method for the final invoice.</div></div> : null}
      {plan?.id && planType === 'deposit' && depositPaid ? <div className="mt-6 rounded-xl border border-ink/10 p-4"><p className="text-sm font-medium">Deposit received. Save a payment method for the final invoice.</p><WhopElements elements={loadWhop()} appearance={{ theme: { appearance: 'light', grayColor: 'gray' } }}><SetupCardOnFile depositPaymentId={depositPaymentId} /></WhopElements><div className="mt-3"><a href="#contact" onClick={onClose} className="text-xs text-ink/60 underline">I’ll arrange the final invoice manually</a></div></div> : null}
      {!plan?.id && <p className="mt-6 rounded-lg bg-[#F4F3F3] p-4 text-sm">Add this service’s Whop plan ID to <code>src/site-config.ts</code> to enable checkout.</p>}
      <p className="mt-4 text-[11px] leading-relaxed text-ink/50">Payment methods and financing options vary by merchant approval, plan, customer eligibility, and device. Wallet buttons require verified payment method domains.</p>
    </div></div>
}

function SetupCardOnFile({ depositPaymentId }: { depositPaymentId: string }) {
  return <Payments accountId={site.accountId} mode="setup" currency="usd"><SetupCardForm depositPaymentId={depositPaymentId} /></Payments>
}

function SetupCardForm({ depositPaymentId }: { depositPaymentId: string }) {
  const payments = usePayments()
  const whop = useWhop()
  const [status, setStatus] = useState('')
  const [setupIntentId, setSetupIntentId] = useState('')
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [customerConsent, setCustomerConsent] = useState(false)
  async function checkSetupStatus(id: string) {
    const response = await fetch(`/api/setup-intent/status?id=${encodeURIComponent(id)}`)
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Could not verify the saved payment method.')
    setStatus(result.status === 'succeeded'
      ? `Payment method saved with Whop. Deposit reference: ${depositPaymentId}. The contractor can send the final invoice manually.`
      : `Whop setup status: ${result.status}. Wait for confirmation before invoicing.`)
  }
  async function saveCard() {
    if (!payments || !customerConsent) return
    setBusy(true)
    setStatus('')
    try {
      const token = await payments.createConfirmationToken({ billingDetails: { email } })
      const response = await fetch('/api/setup-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmationToken: token.confirmationToken, email, depositPaymentId, cardOnFileConsent: customerConsent }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Card setup did not complete.')
      setSetupIntentId(result.id)
      if (result.clientSecret && whop) await whop.payments.handleNextAction({ clientSecret: result.clientSecret })
      await checkSetupStatus(result.id)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Card setup did not complete.')
    } finally { setBusy(false) }
  }
  return <><label className="field-label mb-3">Email<input className="field" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><PaymentElement /><BrandingElement /><label className="mt-4 flex items-start gap-3 text-xs leading-relaxed text-ink/60"><input type="checkbox" required checked={customerConsent} onChange={(event) => setCustomerConsent(event.target.checked)} className="mt-0.5 accent-ink" />I agree to save this payment method for this project. The final balance will be sent separately as a Whop invoice for me to review and pay.</label><button disabled={!payments || busy || !site.accountId || !email.includes('@') || !customerConsent} onClick={saveCard} className="mt-4 rounded-lg bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-40">{busy ? 'Saving…' : 'Save payment method securely'}</button>{setupIntentId && <button disabled={busy} onClick={() => void checkSetupStatus(setupIntentId).catch((error) => setStatus(error instanceof Error ? error.message : 'Could not verify the saved payment method.'))} className="ml-3 text-xs text-ink/60 underline disabled:opacity-40">Check save status</button>}{status && <p role="status" className="mt-3 text-xs text-ink/70">{status}</p>}</>
}
