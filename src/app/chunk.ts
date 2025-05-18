import { openai } from '@/lib/openai';

/**
 * Splits a given text into chunks of 1 to many paragraphs.
*
* @param text - The input text to be chunked.
* @param maxChunkSize - The maximum size (in characters) allowed for each chunk. Default is 1000.
* @param minChunkSize - The minimum size (in characters) required for each chunk. Default is 100.
* @returns An array of chunked text, where each chunk contains 1 or multiple "paragraphs"
*/
export function chunkTextByMultiParagraphs(
    text: string,
    maxChunkSize = 2000,
    minChunkSize = 1500
    ): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
    
    let startIndex = 0;
    while (startIndex < text.length) {
        let endIndex = startIndex + maxChunkSize;
        if (endIndex >= text.length) {
        endIndex = text.length;
        } else {
        // Just using this to find the nearest paragraph boundary
        const paragraphBoundary = text.indexOf("\n\n", endIndex);
        if (paragraphBoundary !== -1) {
            endIndex = paragraphBoundary;
        }
        }
    
        const chunk = text.slice(startIndex, endIndex).trim();
        if (chunk.length >= minChunkSize) {
        chunks.push(chunk);
        currentChunk = "";
        } else {
        currentChunk += chunk + "\n\n";
        }
    
        startIndex = endIndex + 1;
    }
    
    if (currentChunk.length >= minChunkSize) {
        chunks.push(currentChunk.trim());
    } else if (chunks.length > 0) {
        chunks[chunks.length - 1] += "\n\n" + currentChunk.trim();
    } else {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
    }
    
    export async function enhanceChunks(chunks: string[]) {
        const enhancedChunks: string[] = [];
        for (const chunk of chunks) {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: "You are a helpful assistant that is providing context on my product requirement documents. You are given a chunk of text from each PRD. Your job is to clean the formatting of the chunk to be human readable, and also return a summary of the text in a few sentences. This is from documents outlining product features for a Helpdesk Product.I want you to act like an expert product manager and provide a summary of the text in a few sentences Please be concise and to the point. Here is the chunk: " + chunk,
                    },
                ],
            });  
            if (completion.choices[0].message.content) {
                enhancedChunks.push(completion.choices[0].message.content);
            }
        }
        return enhancedChunks;
    }