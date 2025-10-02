import {
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Container,
  Text,
  Section,
  Button,
} from "@react-email/components"

export function DebugEmail(props: { message: string }) {
  return (
    <Html>
      <Head />
      <Preview>📩 Novo e-mail de teste</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <Section>
              <Text className="text-xl font-bold text-gray-800">
                Olá! 👋
              </Text>
              <Text className="text-gray-600 mt-2">
                Este é um email de <b>teste</b> usando{" "}
                <code>@react-email/components</code>.
              </Text>

              <Text className="text-gray-700 mt-4">
                Mensagem recebida:  
                <span className="block mt-1 p-2 bg-gray-100 rounded">
                  {props.message}
                </span>
              </Text>

              <Button
                href="https://github.com/resendlabs/react-email"
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Ver documentação
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

