/** A recorded request made through the fake `fetch`. */
export interface RecordedRequest {
  readonly method: string
  readonly url: URL
  readonly body: unknown
}

export type FakeRoute = (request: RecordedRequest) => Response | undefined

export const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })

/** A `text/event-stream` response emitting one `data:` frame per event. */
export const sse = (events: ReadonlyArray<unknown>): Response => {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      controller.close()
    }
  })
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } })
}

/** `fetch` replacement answering from route functions and recording every request. */
export const makeFakeFetch = (...routes: ReadonlyArray<FakeRoute>) => {
  const requests: Array<RecordedRequest> = []
  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init)
    const text = request.body === null ? "" : await request.text()
    const recorded: RecordedRequest = {
      method: request.method,
      url: new URL(request.url),
      body: text === "" ? undefined : JSON.parse(text)
    }
    requests.push(recorded)
    for (const route of routes) {
      const response = route(recorded)
      if (response !== undefined) return response
    }
    return json(404, { _tag: "NotFound", entity: "route", id: recorded.url.pathname })
  }
  return { fetch: fetch as typeof globalThis.fetch, requests }
}
