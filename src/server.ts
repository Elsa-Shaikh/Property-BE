import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./Config/prisma.config";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
