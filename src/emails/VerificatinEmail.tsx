import {
  Html,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";

interface Props {
  name: string;
  code: string;
}

export default function VerifyEmail({
  name,
  code,
}: Props) {

  return (

    <Html>

      <Body
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "40px",
        }}
      >

        <Container>

          <Heading>
            Verify Your Email
          </Heading>

          <Text>
            Hi {name},
          </Text>

          <Text>
            Your verification code is:
          </Text>

          <Heading>
            {code}
          </Heading>

          <Text>
            This code expires in
            10 minutes.
          </Text>

        </Container>

      </Body>

    </Html>
  );
}