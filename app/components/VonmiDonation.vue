<template>
  <div class="vonmi-donation-container">
    <iframe :srcdoc="iframeContent" style="width:100%; min-height:400px; border:none;" title="Пожертвования"></iframe>
  </div>
</template>

<script setup>
const iframeContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: transparent;
    }
  </style>
</head>
<body>
  <div id="vonmi-widget" data-id="13f1c69585895cd1f25f4709e279aa12"></div>
  <script src="https://cdn.vonmi.org/widget/vonmi-donation.js"><\/script>
</body>
</html>
`
</script>