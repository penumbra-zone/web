function polling() {
  console.log('test polling');
  setTimeout(polling, 1000 * 30);
}

polling();
