This is a URL shortener service.

TO SHORTEN URL:

Go to /new then enter the link, it will respond with a JSON object containing the new URL.

For example:

https://chopurl.herokuapp.com/https://www.google.com

will result in:

{
  "original_url": "https://www.google.com",
  "new_url": "https://chopurl.herokuapp.com/2"
}

*NOTE*

You must include an "http://" or "https://", a "www." and a ".com" in your link or the program will reject it.



TO USE SHORTENED URL:

Simply go to the URL provided by your /new request, and you will be redirected to the URL that you gave when creating the shortened URL.
