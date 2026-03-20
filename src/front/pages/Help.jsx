import { useState } from "react";
import { Link } from "react-router-dom";

export const Help = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            question: "¿Cuánto cuesta el servicio?",
            answer: "El precio varía según la distancia entre la tienda y tu ubicación. Generalmente oscila entre 5€ y 20€. Siempre verás el precio exacto antes de confirmar."
        },
        {
            question: "¿Qué tipo de compras puedo enviar?",
            answer: "Puedes enviar prácticamente cualquier cosa que hayas comprado en una tienda física: ropa, electrónica, libros, artículos deportivos, etc."
        },
        {
            question: "¿Cuánto tiempo tarda la entrega?",
            answer: "El tiempo promedio es de 15-20 minutos, dependiendo de la distancia y el tráfico. Podrás ver el tiempo estimado antes de confirmar tu pedido."
        },
        {
            question: "¿Qué pasa si mi pedido no llega?",
            answer: "Si hay algún problema con tu entrega, nuestro equipo de soporte está disponible 24/7. Ofrecemos reembolso completo si el servicio no se completa."
        },
        {
            question: "¿Cómo sé que mi pedido está seguro?",
            answer: "Todos nuestros riders están verificados con documentación oficial. Además, cada entrega está asegurada y puedes seguir la ubicación del rider en tiempo real."
        },
        {
            question: "¿Puedo programar una entrega para más tarde?",
            answer: "Sí, puedes programar entregas con hasta 24 horas de anticipación. Perfecto para cuando necesitas planificar con tiempo."
        },
        {
            question: "¿Puedo cancelar mi pedido?",
            answer: "Sí, puedes cancelar tu pedido antes de que el rider lo recoja sin ningún coste adicional."
        },
        {
            question: "¿Cómo me convierto en rider?",
            answer: "Es muy fácil. Regístrate como rider en la app, completa la verificación de identidad y empieza a recibir pedidos. Todo el proceso tarda menos de 24 horas."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="help-page">

            {/* HERO */}
            <div className="help-hero">
                <h1 className="help-hero-title">
                    Centro de <span className="highlight">Ayuda</span>
                </h1>
                <p className="help-hero-subtitle">
                    Todo lo que necesitas saber sobre SHOP&GO
                </p>
            </div>

            {/* CONTACTO RÁPIDO */}
            <div className="help-contact-cards">
                <div className="contact-card">
                    <span className="contact-emoji">📧</span>
                    <h3>Email</h3>
                    <p>ayuda@shopandgo.com</p>
                </div>
                <div className="contact-card">
                    <span className="contact-emoji">💬</span>
                    <h3>Chat en vivo</h3>
                    <p>Disponible 24/7</p>
                </div>
                <div className="contact-card">
                    <span className="contact-emoji">📱</span>
                    <h3>Teléfono</h3>
                    <p>+34 900 123 456</p>
                </div>
            </div>

            {/* FAQ */}
            <div className="help-faq-section">
                <h2 className="help-section-title">Preguntas Frecuentes</h2>

                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`faq-card ${openFaq === index ? "faq-open" : ""}`}
                            onClick={() => toggleFaq(index)}
                        >
                            <div className="faq-header">
                                <h3 className="faq-question">{faq.question}</h3>
                                <span className={`faq-arrow ${openFaq === index ? "faq-arrow-open" : ""}`}>›</span>
                            </div>
                            {openFaq === index && (
                                <p className="faq-answer">{faq.answer}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="help-cta">
                <h2>¿No encuentras lo que buscas?</h2>
                <p>Nuestro equipo está listo para ayudarte</p>
                <a href="mailto:ayuda@shopandgo.com" className="btn-help-cta">Contactar Soporte</a>
            </div>

        </div>
    );
};