import twilio from "twilio";
import Complaint from "../schemas/complaintschema";
const { VoiceResponse } = twilio;

// Add this function to your existing code
export const userStatusCheckHandler = async (req, res) => {
  try {
    const { pnrNumber } = req.query;
    const twiml = new VoiceResponse();

    if (!pnrNumber) {
      // If no PNR provided, ask for it
      const gather = twiml.gather({
        numDigits: 10,
        action: 'https://rail-madad-backend-p4vg.onrender.com/api/usertest/user-status-check',
        method: 'POST',
        timeout: 10,
        input: 'dtmf'
      });
      
      gather.say({
        voice: 'alice',
        language: 'en-IN'
      }, 'Kripya apna 10-digit PNR number daale hash key dabane ke baad.');
      
      twiml.redirect('https://rail-madad-backend-p4vg.onrender.com/api/usertest/user-status-check');
    } else {
      // Find complaints by PNR
      const complaints = await Complaint.find({ pnrNumber });
      
      if (complaints.length === 0) {
        twiml.say({
          voice: 'alice',
          language: 'en-IN'
        }, 'Is PNR number se koi complaint nahi mili. Kripya apna PNR number dobara check kare.');
        twiml.hangup();
      } else {
        // Check if any complaints are resolved
        const resolvedComplaints = complaints.filter(c => c.resolved);
        const pendingComplaints = complaints.filter(c => !c.resolved);
        
        let message = '';
        
        if (resolvedComplaints.length > 0) {
          message += `Aapke ${resolvedComplaints.length} complaints resolve ho chuke hain. `;
        }
        
        if (pendingComplaints.length > 0) {
          message += `Aapke ${pendingComplaints.length} complaints abhi bhi pending hain. `;
        }
        
        message += 'Dobara sunne ke liye 1 dabaye. Agar aapki complaint resolve ho gayi hai to 2 dabaye. Agar aapki complaint abhi bhi resolve nahi hui hai to control room se baat karne ke liye 3 dabaye.';
        
        const gather = twiml.gather({
          numDigits: 1,
          action: `https://rail-madad-backend-p4vg.onrender.com/api/usertest/user-status-action?pnrNumber=${pnrNumber}`,
          method: 'POST',
          timeout: 10
        });
        
        gather.say({
          voice: 'alice',
          language: 'en-IN'
        }, message);
        
        // If no input, redirect to same URL with PNR
        twiml.redirect(`https://rail-madad-backend-p4vg.onrender.com/api/usertest/user-status-check?pnrNumber=${pnrNumber}`);
      }
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error("User Status Check Error:", error);
    
    const twiml = new VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-IN'
    }, 'Kuch technical problem aa rahi hai. Kripya thodi der baad phir try kare.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};


export const userStatusActionHandler = async (req, res) => {
  try {
    const { pnrNumber } = req.query;
    const digits = req.body.Digits;
    
    const twiml = new VoiceResponse();
    
    switch (digits) {
      case '1': // Repeat status
        twiml.redirect(`https://rail-madad-backend-p4vg.onrender.com/api/usertest/user-status-check?pnrNumber=${pnrNumber}`);
        break;
        
      case '2': // Complaint resolved
        twiml.say({
          voice: 'alice',
          language: 'en-IN'
        }, 'Dhanyavaad. Aapka feedback hamare liye important hai. Aapki journey pleasant ho.');
        twiml.hangup();
        break;
        
      case '3': // Connect to control room
        twiml.say({
          voice: 'alice',
          language: 'en-IN'
        }, 'Aapko control room se connect kiya ja raha hai. Kripya wait kare.');
        
        // Dial control room number
        twiml.dial({
          action: 'https://rail-madad-backend-p4vg.onrender.com/api/usertest/call-completed',
          method: 'POST'
        }, process.env.CONTROL_ROOM_NUMBER || '+911234567890');
        
        break;
        
      default: // Invalid input
        twiml.say({
          voice: 'alice',
          language: 'en-IN'
        }, 'Galat input. Kripya phir se try kare.');
        twiml.redirect(`https://rail-madad-backend-p4vg.onrender.com/api/usertest/user-status-check?pnrNumber=${pnrNumber}`);
        break;
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error("User Status Action Error:", error);
    
    const twiml = new VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-IN'
    }, 'Kuch technical problem aa rahi hai. Kripya thodi der baad phir try kare.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

// Add this function to handle POST requests for PNR input
export const userStatusCheckPost = async (req, res) => {
  try {
    const digits = req.body.Digits;
    const twiml = new VoiceResponse();
    
    if (digits && digits.length === 10) {
      // Redirect to status check with PNR
      twiml.redirect(`https://rail-madad-backend-p4vg.onrender.com/api/usertest/user-status-check?pnrNumber=${digits}`);
    } else {
      twiml.say({
        voice: 'alice',
        language: 'en-IN'
      }, 'Invalid PNR number. Kripya phir se try kare.');
      twiml.redirect('https://rail-madad-backend-p4vg.onrender.com/api/usertest/user-status-check');
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error("User Status Check POST Error:", error);
    
    const twiml = new VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-IN'
    }, 'Kuch technical problem aa rahi hai. Kripya thodi der baad phir try kare.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

// Add this function to handle call completion
export const callCompletedHandler = async (req, res) => {
  try {
    const twiml = new VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-IN'
    }, 'Rail Madad Seva use karne ke liye dhanyavaad. Aapki journey pleasant ho.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error("Call Completed Error:", error);
    
    const twiml = new VoiceResponse();
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};