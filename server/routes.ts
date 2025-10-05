import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertFileSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { createProxyMiddleware } from "http-proxy-middleware";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المشاريع" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "المشروع غير موجود" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المشروع" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "المشروع غير موجود" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "المشروع غير موجود" });
      }
      res.json({ message: "تم حذف المشروع بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المشروع" });
    }
  });

  app.get("/api/projects/:id/files", async (req, res) => {
    try {
      const files = await storage.getProjectFiles(req.params.id);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الملفات" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const validatedData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(validatedData);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صحيحة" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "الملف غير موجود" });
      }
      res.json({ message: "تم حذف الملف بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف الملف" });
    }
  });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف" });
      }

      const projectId = req.body.projectId;
      if (!projectId) {
        return res.status(400).json({ message: "معرف المشروع مطلوب" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const fileData = {
        projectId,
        name: req.file.originalname,
        type: req.file.mimetype.startsWith("video") ? "video" : 
              req.file.mimetype.startsWith("audio") ? "audio" : "subtitle",
        size: req.file.size,
        url: fileUrl,
      };

      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ message: "خطأ في رفع الملف" });
    }
  });

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
  
  app.use("/api/video", createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  }));
  
  app.use("/api/audio", createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  }));
  
  app.use("/api/subtitle", createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  }));
  
  app.use("/api/export", createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  }));
  
  app.use("/api/effects", createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  }));
  
  app.use("/api/download", createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  }));
  
  app.use("/health", createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  }));
  
  app.use("/processed", createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
  }));
  
  const httpServer = createServer(app);

  return httpServer;
}
