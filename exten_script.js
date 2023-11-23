// (() => {

//     /*
//     Store the calculated ciphertext and counter here, so we can decrypt the message later.
//     */
//     let ciphertext;
//     let counter;

//     /*
//     Fetch the contents of the "message" textbox, and encode it
//     in a form we can use for the encrypt operation.
//     */
//     function getMessageEncoding() {
//         const messageBox = "some sample text for checking out encryption";
//         let message = messageBox.value;
//         let enc = new TextEncoder();
//         return enc.encode(message);
//     }

//     /*
//     Get the encoded message, encrypt it and display a representation
//     of the ciphertext in the "Ciphertext" element.
//     */
//     async function encryptMessage(key) {
//         let encoded = getMessageEncoding();
//         // The counter block value must never be reused with a given key.
//         counter = crypto.getRandomValues(new Uint8Array(16)),
//             ciphertext = await crypto.subtle.encrypt(
//                 {
//                     name: "AES-CTR",
//                     counter,
//                     length: 64
//                 },
//                 key,
//                 encoded
//             );

//         let buffer = new Uint8Array(ciphertext, 0, 5);
//         console.log(`${buffer}...[${ciphertext.byteLength} bytes total]`);
//     }

//     /*
//     Fetch the ciphertext and decrypt it.
//     Write the decrypted message into the "Decrypted" box.
//     */
//     async function decryptMessage(key) {
//         let decrypted = await crypto.subtle.decrypt(
//             {
//                 name: "AES-CTR",
//                 counter,
//                 length: 64
//             },
//             key,
//             ciphertext
//         );

//         let dec = new TextDecoder();
//         console.log(dec.decode(decrypted));
//     }

//     /*
//     Generate an encryption key, then set up event listeners
//     on the "Encrypt" and "Decrypt" buttons.
//     */
//     crypto.subtle.generateKey(
//         {
//             name: "AES-CTR",
//             length: 256
//         },
//         true,
//         ["encrypt", "decrypt"]
//     ).then((key) => {
//         encryptMessage(key);

//         decryptMessage(key);
//     });

// })();
