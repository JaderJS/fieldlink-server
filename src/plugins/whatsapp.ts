import { Client, LocalAuth } from "whatsapp-web.js"
import qrcode from "qrcode-terminal"
import qrCode from "qrcode"
import { resend } from "@/core/email"
import { buffer } from "stream/consumers"

const client = new Client({
  authStrategy: new LocalAuth()
})

client.on('qr', async (qr) => {
  const buffer = await qrCode.toBuffer(qr)

  const html = `
      <div style="text-align:center">
      <h2>Escaneie o QR para conectar o WhatsApp</h2>
      <img src="cid:qrcode" alt="QR Code" style="width:250px;height:250px"/>
    </div>
      `.trim()

  const resp = await resend.emails.send({
    from: "fieldlink@resend.dev",
    to: "jader.jader55@gmail.com",
    subject: "Qrcode whatsapp boot fieldlink",
    html: html,
    attachments: [
      {
        filename: "qrcode.png",
        content: buffer.toString("base64"),
        contentId: "qrcode", // 👈 o mesmo usado em cid:
      },
    ],
  })
})

client.on("message", async (message) => {
  console.log(message)
  const [cmd, ...args] = message.body.trim().toLowerCase().split(" ")
  console.log(cmd)
  switch (cmd) {
    case "ping":
      await message.reply("pong 🏓")
      break

    case "echo":
      await message.reply(args.join(" ") || "Nada pra repetir 🤷")
      break
  }
})

client.on('ready', () => {
  console.log('Client whatsapp is ready!')
})


client.initialize()