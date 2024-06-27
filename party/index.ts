import type * as Party from 'partykit/server'

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  poll: any | undefined

  async onRequest(req: Party.Request) {
    if (req.method === 'POST') {
      const poll = (await req.json()) as any
      this.poll = { ...poll, votes: poll.options.map(() => 0) }
    }

    if (this.poll) {
      return new Response(JSON.stringify(this.poll), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Not found', { status: 404 })
  }

  async onStart() {}

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {}

  async onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    const parsedMessage = JSON.parse(message as string)

    if (parsedMessage.type === 'new_chat') {
      this.room.broadcast(
        JSON.stringify({
          type: 'new_chat',
          message: parsedMessage.message,
          sender: parsedMessage.sender,
          time: parsedMessage.time,
          id: parsedMessage.id,
        }),
        [sender.id]
      )
    }
    if (parsedMessage.type === 'update_animation') {
      this.room.broadcast(
        JSON.stringify({
          type: 'update_animation',
          message: parsedMessage.animation,
        }),
        [sender.id]
      )
    }
  }
}

Server satisfies Party.Worker
