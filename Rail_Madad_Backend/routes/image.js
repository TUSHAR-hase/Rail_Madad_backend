import express from "express";
import { voiceHandler,voiceResponse,callStatusHandler ,submitComplaint,getstatus} from "../api/imageapi.js";

const router = express.Router();

// POST /api/complaints
router.post('/voice-handler/:complaintId', voiceHandler);
router.post('/voice-response/:complaintId',voiceResponse);
router.post('/call-status/:complaintId', callStatusHandler);
router.post("/complaint/:userId", submitComplaint);
router.get("/getcomplaint/:complaintId",getstatus);


export default router;

 
