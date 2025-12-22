import { Prisma } from "@/../prisma/generated/client"

import { Body, Button, Container, Head, Html, Img, Preview, Section, Tailwind, Text } from "@react-email/components"

type IOrder = Prisma.OrderGetPayload<{
    include: {
        works: {
            include: {
                sales: {
                    include: {
                        productsOnSale: {
                            include: { product: { include: { categories: true } } }
                        }
                    }
                }
            }
        },
        sales: {
            include: {
                productsOnSale: {
                    include: { product: { include: { categories: true } } }
                }
            }
        },
        client: {
            include: {
                properties: {
                    include: {
                        stations: true
                    }
                }
            }
        },
        transaction: {
            include: {
                bank: true,
                company: true,
                installments: true
            }
        }
    }
}>

function money(v?: number | null) {
    if (v == null) return "—";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OrderTemplate({ order }: { order: IOrder }) {
    const formatMoney = (v: number | null | undefined) =>
        v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <Html>
            <Head />
            <Preview>Relatório da ordem #{String(order.id)} — resumo e itens</Preview>
            <Tailwind>
                <Body className="bg-gray-50 font-sans">
                    <Container className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                        {/* Header */}
                        <Section>
                            <Text className="text-2xl font-bold text-yellow-600">R$ {(order.total / 100).toLocaleString('pt-BR')}</Text>
                            <Text className="text-sm text-gray-500 mt-1">
                                Ordem #{order.id} • {new Date(order.createdAt).toLocaleString("pt-BR")}
                            </Text>
                        </Section>

                        {/* Cliente e meta */}
                        <Section className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <Text className="font-semibold">Cliente</Text>
                                <Text>{order.client?.name ?? "—"}</Text>
                            </div>
                            <div>
                                <Text className="font-semibold">Status</Text>
                                <Text>{order.flag ?? "—"}</Text>
                            </div>
                        </Section>

                        {/* Tabela de itens (estilo) */}
                        <Section className="mt-6">
                            <Text className="font-semibold mb-2">Itens</Text>

                            {/* cabeçalho simples */}
                            <div style={{ width: "100%", borderTop: "1px solid #eee", paddingTop: 8 }}>
                                {/** iterar vendas em order.sales e dentro productsOnSale */}
                                {order.sales?.map((sale) => (
                                    <div key={sale.id} style={{ marginBottom: 12 }}>
                                        <Text className="text-sm font-medium">Venda #{sale.id} — Total: {money(sale.total)}</Text>

                                        {/* itens da venda */}
                                        {sale.productsOnSale?.map((pos) => {
                                            const p = pos.product;
                                            return (
                                                <div
                                                    key={`${p.id}`}
                                                    className="flex items-center justify-between py-3 border-b"
                                                    style={{ gap: 12 }}
                                                >
                                                    <div className="flex items-center" style={{ gap: 12 }}>
                                                        <div style={{ width: 60, height: 60 }}>
                                                            {/* imagem: pode ser url absoluta ou base64 */}
                                                            <Img src={p?.pictureUrl ?? "https://via.placeholder.com/60"} alt={p?.name ?? ""} width={60} height={60} />
                                                        </div>
                                                        <div>
                                                            <Text className="font-medium">{p?.name ?? "Produto"}</Text>
                                                            <div style={{ marginTop: 4 }}>
                                                                {/* badges */}
                                                                {(p?.categories ?? []).slice(0, 3).map(({ id, name }) => (
                                                                    <span key={id} className="px-2 py-0.5 text-xs rounded mr-2" style={{ background: "#f0f0f0" }}>
                                                                        {name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ textAlign: "right", minWidth: 180 }}>
                                                        <div className="text-sm">Qtd: <strong>{pos.quantity}</strong></div>
                                                        <div className="text-sm">Unit: {money(pos.price)}</div>
                                                        <div className="text-sm font-semibold">Subtotal: {money((pos.price ?? 0) * (pos.quantity ?? 1))}</div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}

                                {/* também incluir works -> sales (se houver) */}
                                {order.works?.map((w) => (
                                    <div key={w.id} style={{ marginTop: 8 }}>
                                        <Text className="text-sm font-medium">Work: {w.title ?? `#${w.id}`}</Text>
                                        {w.sales?.map((s) =>
                                            s.productsOnSale?.map((pos) => {
                                                const p = pos.product;
                                                return (
                                                    <div key={`${pos.productId}-${pos.saleId}`} className="flex items-center justify-between py-3 border-b" style={{ gap: 12 }}>
                                                        <div className="flex items-center" style={{ gap: 12 }}>
                                                            <div style={{ width: 60, height: 60 }}>
                                                                <Img src={p?.pictureUrl ?? "https://via.placeholder.com/60"} alt={p?.name ?? ""} width={60} height={60} />
                                                            </div>
                                                            <div>
                                                                <Text className="font-medium">{p?.name ?? "Produto"}</Text>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: "right", minWidth: 180 }}>
                                                            <div className="text-sm">Qtd: <strong>{pos.quantity}</strong></div>
                                                            <div className="text-sm">Unit: {money(pos.price)}</div>
                                                            <div className="text-sm font-semibold">Subtotal: {money((pos.price ?? 0) * (pos.quantity ?? 1))}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* Resumo financeiro e botão PDF */}
                        {/* <Section className="mt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Text className="text-sm text-gray-600">Subtotal: {money(order.subtotal)}</Text>
                                    <Text className="text-sm text-gray-600">Desconto: {money(order.discount)}</Text>
                                    <Text className="text-lg font-bold">Total: {money(order.total)}</Text>
                                </div>
                                {downloadUrl ? (
                                    <div>
                                        <Button href={downloadUrl} className="bg-blue-600 text-white px-4 py-2 rounded">Baixar PDF</Button>
                                    </div>
                                ) : null}
                            </div>
                        </Section> */}

                        <Section className="mt-4">
                            <Text className="text-xs text-gray-500">Se precisar de suporte técnico detalhado sobre a instalação — responda este e-mail e nossa equipe de Engenharia de Telecom entrará em contato.</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}