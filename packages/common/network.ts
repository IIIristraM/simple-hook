import https from 'https';
import urlLib from 'url';

import { streamToString } from './stream';

export function downloadFile(url: string) {
    return new Promise<string>((resolve, reject) => {
        try {
            https.get(url, async function (response) {
                let redirect: string = '';
                if (
                    response.statusCode &&
                    response.statusCode > 300 &&
                    response.statusCode < 400 &&
                    response.headers.location
                ) {
                    const redirectLocation = urlLib.parse(response.headers.location);
                    redirect = redirectLocation.hostname
                        ? response.headers.location
                        : `${urlLib.parse(url)}/${response.headers.location}`;
                }

                try {
                    resolve(redirect ? await downloadFile(redirect) : await streamToString(response));
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}
