import { NextRequest, NextResponse } from "next/server";
import {
  countRecentFailedPinAttempts,
  getActiveSessionByPin,
  getClientIp,
  getSessionItems,
  hasReachedPinAttemptLimit,
  normalizePinInput,
  registerPinAttempt,
} from "@/app/api/shared-cart/_lib";

type JoinBody = {
  pin?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as JoinBody;
  const normalizedPin = normalizePinInput(body.pin ?? "");
  if (normalizedPin.length !== 4) {
    return NextResponse.json({ error: "Ingresa un PIN valido de 4 digitos" }, { status: 400 });
  }

  const ipAddress = getClientIp(request);
  const failedAttempts = await countRecentFailedPinAttempts(ipAddress);
  if (hasReachedPinAttemptLimit(failedAttempts)) {
    return NextResponse.json(
      { error: "Superaste el limite de intentos para unirte. Intenta nuevamente en 1 hora." },
      { status: 429 },
    );
  }

  const sessionResult = await getActiveSessionByPin(normalizedPin);
  if ("error" in sessionResult) {
    await registerPinAttempt(ipAddress, normalizedPin, false);
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status ?? 404 });
  }

  await registerPinAttempt(ipAddress, normalizedPin, true);
  const items = await getSessionItems(sessionResult.session.id);

  return NextResponse.json({
    sessionId: sessionResult.session.id,
    pin: sessionResult.session.pin_4,
    expiresAt: sessionResult.session.expires_at,
    items,
  });
}
