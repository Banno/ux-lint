# Custom HTMLHint Rules

## `banno/doc-lang`

For accessibility, HTML documents should specify a language.

```html
<html><!-- invalid, must have lang -->
<html lang=""><!-- invalid, can't be empty -->

<!-- valid -->
<html lang="en">
```

## `banno/link-href`

Anchor tags (links) should have `href` attributes, and they should specify a valid target.

```html
<a><!-- invalid, needs an href -->
<a href=""><!-- invalid, shouldn't be blank -->
<a href="#"><!-- invalid, placeholder -->
<a href="javascript:void(0)"><!-- invalid -->

<a href="http://example.com"><!-- valid URL -->
<a href="/foo"><!-- valid path-->
<a href="#foo"><!-- valid anchor-->
<a href><!-- valid, assumes JS manages the click -->
```

## `banno/meta-charset-utf8`

A meta tag defining the charset is required in HTML, and UTF8 is the best choice. Ideally, it should be the first tag in the `<head>`, so that the user agent can adjust its parsing (if necessary) as soon as possible.

```html
<!-- invalid, needs to define a charset -->
<head>
  <title>Here is a title</title>
</head>

<!-- invalid, should be UTF-8 -->
<head>
  <meta charset="Windows-1252">
  <title>Here is a title</title>
</head>

<!-- warning, should be the first tag in <head> -->
<head>
  <title>Here is a title</title>
  <meta charset="UTF-8">
</head>

<!-- valid -->
<head>
  <meta charset="UTF-8">
  <title>Here is a title</title>
</head>
```
