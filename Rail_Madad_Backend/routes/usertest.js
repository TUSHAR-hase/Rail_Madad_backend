import express from 'express';

import {userStatusCheckPost,userStatusActionHandler,callCompletedHandler,userStatusCheckHandler} from '../api/usertest.js';


const router= express.Router();


app.get('/api/usertest/user-status-check',userStatusCheckHandler );
app.post('/api/usertest/user-status-check', userStatusCheckPost);
app.post('/api/usertest/user-status-action', userStatusActionHandler);
app.post('/api/usertest/call-completed', callCompletedHandler);

export default router;