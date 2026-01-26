
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (process.env.GEMINI_API_KEY as string) || (process.env.API_KEY as string);

if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    console.warn("Gemini API Key não configurada ou está com valor padrão.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Busca uma URL de imagem para um produto usando o Gemini.
 * O prompt é otimizado para encontrar imagens com fundo branco e sem preços.
 */
export const searchProductImage = async (productName: string): Promise<string | null> => {
    if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
        throw new Error("API Key do Gemini não configurada.");
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        const prompt = `Encontre uma URL direta de imagem de alta qualidade para o produto: "${productName}".
    Regras:
    1. A imagem deve ter fundo branco (clean background).
    2. A imagem NÃO deve conter preços ou textos promocionais.
    3. Retorne APENAS a URL da imagem no formato texto puro.
    4. Se for uma URL do Google Imagens, tente extrair a URL direta da imagem (ex: terminando em .jpg, .png).
    5. Se não encontrar uma URL confiável, retorne "NOT_FOUND".
    
    Busca por: imagem ${productName} fundo branco`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        if (text === "NOT_FOUND" || !text.startsWith("http")) {
            return null;
        }

        return text;
    } catch (error) {
        console.error("Erro ao buscar imagem com Gemini:", error);
        return null;
    }
};
