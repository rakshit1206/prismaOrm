import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.post(`/post`, async (req, res) => {
  //create a new post and associate it with an author
  const { title, content, authorEmail } = req.body;
  const result = await prisma;
  res.json(result);
});

app.put("/post/:id/views", async (req, res) => {
  const { id } = req.params;
  //update the view count field for a specific post
  try {
    const post = await prisma;

    res.json(post);
  } catch (error) {
    res.json({ error: `Post with ID ${id} does not exist in the database` });
  }
});

app.put("/publish/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // toggle the `published` field on the specified post
    const updatedPost = await prisma;

    res.json(updatedPost);
  } catch (error) {
    res.json({ error: `Post with ID ${id} does not exist in the database` });
  }
});

app.delete(`/post/:id`, async (req, res) => {
  //delete the post
  const { id } = req.params;
  const post = await prisma;
  res.json(post);
});

app.get("/users", async (req, res) => {
  //return all the users
  const users = await prisma;
  res.json(users);
});

app.get("/user/:id/drafts", async (req, res) => {
  const { id } = req.params;
  //return all posts where the published field equals false
  const drafts = await prisma;
  res.json(drafts);
});

app.get(`/post/:id`, async (req, res) => {
  const { id }: { id?: string } = req.params;
  //return the post
  const post = await prisma;
  res.json(post);
});

app.get("/feed", async (req, res) => {
  const { searchString, skip, take, orderBy } = req.query;
  // 1. return all posts where the published field is set to true.
  // 2. return the associated author with the post
  // 3. skip the amount of posts specified
  // 4. take the amount of posts specified
  // 5. order the posts by the field `updated_at` descending or ascending basesd on the parameter `orderBy`
  // 6. if the `searchString` parameter is not an empty, use the string to filter posts not matching the post titles or post content

  const posts = await prisma.post.findMany();

  res.json(posts);
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000`)
);
