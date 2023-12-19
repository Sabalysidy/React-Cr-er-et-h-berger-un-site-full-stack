import express from "express";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";

const app = express();
const port = 4000;

app.use(express.json());
dotenv.config();

const uri = process.env.STRING_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', async (_, res) => {
  try {
    // Connexion à la base de données MongoDB
    await client.connect();

    // Accéder à la base de données 'blog' et à la collection 'posts'
    const database = client.db('blog');
    const collection = database.collection('posts');

    // Récupérer les données de la collection 'posts'
    const results = await collection.find().toArray();

    // Envoyer les données en tant que réponse JSON au navigateur
    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur :", error);

    // Vérifier s'il s'agit d'une erreur de connexion à MongoDB
    if (error.name === 'MongoNetworkError') {
      res.status(500).send("Impossible de se connecter à la base de données");
    } else {
      // Pour d'autres erreurs, envoyer un message générique d'erreur interne du serveur
      res.status(500).send("Erreur Interne du Serveur");
    }
  } finally {
    // S'assurer que le client MongoDB est fermé à la fin
    try {
      await client.close();
    } catch (closeError) {
      console.error("Erreur lors de la fermeture du client MongoDB :", closeError);
    }
  }
});

// Route POST pour ajouter des données à la collection 'posts'
app.post('/insert', async (req, res) => {
  try {
    // Connexion à la base de données MongoDB
    await client.connect();

    // Accéder à la base de données 'blog' et à la collection 'posts'
    const database = client.db('blog');
    const collection = database.collection('posts');

    // Récupérer les données du corps de la requête
    // const postData = req.body;
    const postData = {title: "title", content: "content..."};

    // Ajouter les données à la collection 'posts'
    const result = await collection.insertOne(req.body);

    // Envoyer la confirmation en tant que réponse JSON au navigateur
    res.status(201).json({ message: "Données ajoutées avec succès", insertedId: result.insertedId });
  } catch (error) {
    console.error("Erreur :", error);

    // Vérifier s'il s'agit d'une erreur de connexion à MongoDB
    if (error.name === 'MongoNetworkError') {
      res.status(500).send("Impossible de se connecter à la base de données");
    } else {
      // Pour d'autres erreurs, envoyer un message générique d'erreur interne du serveur
      res.status(500).send("Erreur Interne du Serveur");
    }
  } finally {
    // S'assurer que le client MongoDB est fermé à la fin
    try {
      await client.close();
    } catch (closeError) {
      console.error("Erreur lors de la fermeture du client MongoDB :", closeError);
    }
  }
});

app.listen(port, () => {
  console.log(`Server started successfully on port ${port}`);
});
