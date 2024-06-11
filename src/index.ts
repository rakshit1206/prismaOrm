import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.post(`/post`, async (req, res) => {
  //create a new post and associate it with an author
  const { title, content, authorEmail } = req.body;

  // Find the author by their email
  const author = await prisma.user.findUnique({ where: { email: authorEmail } });

  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }

  // Create a new post and associate it with the author
  const result = await prisma.post.create({
    data: {
      title,
      content,
      authorId: author.id,
    },
  });

  res.json(result);
});

app.put("/post/:id/views", async (req, res) => {
  const { id } = req.params;
  //update the view count field for a specific post
  try {
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });

    if (!post) {
      return res.status(404).json({ error: `Post with ID ${id} does not exist in the database` });
    }

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: { viewCount: post.viewCount + 1 },
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: `Error updating post with ID ${id}` });
  }
});

app.put("/publish/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the post by its ID
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });

    if (!post) {
      return res.status(404).json({ error: `Post with ID ${id} does not exist in the database` });
    }

    // toggle the `published` field on the specified post
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: { published: !post.published },
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: `Error updating post with ID ${id}` });
  }
});

app.delete(`/post/:id`, async (req, res) => {
  //delete the post
  const { id } = req.params;

  try {
    const post = await prisma.post.delete({
      where: { id: Number(id) },
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: `Error deleting post with ID ${id}` });
  }
});


app.get("/users", async (req, res) => {
  //return all the users
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: `Error fetching users` });
  }
});

app.get("/user/:id/drafts", async (req, res) => {
  const { id } = req.params;

  try {
    //return all posts where the published field equals false
    const drafts = await prisma.post.findMany({
      where: {
        authorId: Number(id),
        published: false,
      },
    });

    res.json(drafts);
  } catch (error) {
    res.status(500).json({ error: `Error fetching drafts for user with ID ${id}` });
  }
});


app.get(`/post/:id`, async (req, res) => {
  const { id }: { id?: string } = req.params;

  try {
    //return the post
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    });

    if (!post) {
      return res.status(404).json({ error: `Post with ID ${id} does not exist in the database` });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: `Error fetching post with ID ${id}` });
  }
});

app.get("/feed", async (req, res) => {
  const { searchString, skip, take, orderBy } = req.query;

  try {
    // Parse query parameters
    const skipNumber = skip ? parseInt(skip as string) : undefined;
    const takeNumber = take ? parseInt(take as string) : undefined;
    const orderByObject = orderBy ? { updatedAt: orderBy as 'asc' | 'desc' } : undefined;

    // Fetch posts
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: searchString as string | undefined } },
          { content: { contains: searchString as string | undefined } },
        ],
      },
      include: { author: true },
      skip: skipNumber,
      take: takeNumber,
      orderBy: orderByObject,
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: `Error fetching feed` });
  }
});

app.get("/", async (req, res) => {
  res.json({ message: "Hello World" });
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000`)
);