async function deriveKeyFromPassword(password, salt, iterations, keyLength) {
    const encodedPassword = new TextEncoder().encode(password);
    const encodedSalt = new TextEncoder().encode(salt);

    const derivedKey = await crypto.subtle.importKey(
        'raw',
        encodedPassword,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encodedSalt,
            iterations: iterations,
            hash: 'SHA-256',
        },
        derivedKey,
        { name: 'AES-GCM', length: keyLength * 8 },
        true,
        ['encrypt', 'decrypt']
    );

    return key;
}

async function encryptWithPassword(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random salt
    const iterations = 10; // Adjust the number of iterations as needed
    const keyLength = 32; // AES-256 key length in bytes

    const key = await deriveKeyFromPassword(password, salt, iterations, keyLength);

    const encodedText = new TextEncoder().encode(plaintext);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedText
    );

    return { ciphertext, salt, iterations, iv };
}

async function decryptWithPassword(ciphertext, password, salt, iterations, iv) {
    const key = await deriveKeyFromPassword(password, salt, iterations, 32);

    const decodedText = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
    );

    return new TextDecoder().decode(decodedText);
}

var crypt = {
    init: async function() {
        const password = 'user-entered-password';
        const plaintext = 'Your secret message';

        // Encrypt
        const { ciphertext, salt, iterations, iv } = await encryptWithPassword(plaintext, password);

        // Decrypt
        const decryptedText = await decryptWithPassword(ciphertext, password, salt, iterations, iv);

        console.log('Original Text:', plaintext);
        console.log('Encrypted Text:', new Uint8Array(ciphertext));
        console.log('Decrypted Text:', decryptedText);
    }
}

