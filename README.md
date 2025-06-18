# NextJS JSON CRUD

An app with a restful CRUD api, not on databases, but on JSON files. Made with Cursor editor.

TO DO NEXT: the CRUD is implemented on dummy data named "blobs", and the login-logout works well. Next step is to:

1. implement CRUD API for normal data (like page, paragraph, article, other)
2. implement frontend views for such data. 
    2.1 First we can do that for articles, with article lists and article single views. 
    2.2 Then we can try doing it for pages, generating routes from page url fields
    2.3 Then we can try to handle sub-content, for example, paragraphs in pages. Maybe in the same JSON objects as pages, there would be a "content" array, containing paragraphs.