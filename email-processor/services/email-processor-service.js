

// Decode the email body
function getBody(messagePayload) {
    let encodedBody = '';
    if (messagePayload.parts) {
        encodedBody = messagePayload.parts.filter(part => part.mimeType === 'text/html' || part.mimeType === 'text/plain')[0].body.data;
    } else {
        encodedBody = messagePayload.body.data;
    }
    const buffer = Buffer.from(encodedBody, 'base64');
    return buffer.toString('utf-8');
}

async function processEmail(emailId, emailProvider) {
    const emailDetailRes = await emailProvider.getEmailDetail(emailId);
    const body = getBody(emailDetailRes.data.payload);
    //const from = emailDetailRes.data.payload.headers["from"];
    console.log(emailDetailRes.data.payload.headers);
}

module.exports = {
    processEmail
};