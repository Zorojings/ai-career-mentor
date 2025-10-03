import OpenAI from "openai";
import { Client, Databases } from "node-appwrite";

export default async ({ req, res, log, error }) => {
 try {
    // Env debug log
    log("Env check:", {
      endpoint: process.env.APPWRITE_ENDPOINT,
      projectId: process.env.APPWRITE_PROJECT_ID,
      dbId: process.env.APPWRITE_DATABASE_ID,
      collectionId: process.env.APPWRITE_PROFILES_COLLECTION_ID,
      hasApiKey: !!process.env.APPWRITE_API_KEY,
      hasOpenAiKey: !!process.env.OPENAI_API_KEY
    });

    // Init Appwrite
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const DB_ID = process.env.APPWRITE_DATABASE_ID;
    const PROFILES_COLLECTION_ID = process.env.APPWRITE_PROFILES_COLLECTION_ID;

    if (!DB_ID || !PROFILES_COLLECTION_ID) {
      throw new Error("Missing DB_ID or PROFILES_COLLECTION_ID env vars");
    }

    let payload;
    try {
      payload = JSON.parse(req.payload);
    } catch {
      throw new Error("Invalid request body. Expected JSON with profileId");
    }

    const { profileId } = payload;
    if (!profileId) throw new Error("Missing profileId");

    log("Fetching profile document:", profileId);
    const profile = await databases.getDocument(DB_ID, PROFILES_COLLECTION_ID, profileId);

    const prompt = `
      Act as an expert career mentor... 
      (your same prompt text)
    `;

    log("Calling OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    const recommendationText = completion.choices?.[0]?.message?.content || "No recommendation generated";

    log("Updating DB with recommendation...");
    await databases.updateDocument(DB_ID, PROFILES_COLLECTION_ID, profileId, {
      recommendation: recommendationText
    });

    return res.json({ success: true, recommendation: recommendationText });
  } catch (err) {
    error(err.toString());
    return res.json({ success: false, error: err.message }, 500);
  }
};
