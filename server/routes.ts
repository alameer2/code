import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertFileSchema } from "@shared/schema";

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
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ message: "المشروع غير موجود" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث المشروع" });
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

  const httpServer = createServer(app);

  return httpServer;
}
