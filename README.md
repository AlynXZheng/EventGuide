# EventGuide
A full stack event-driven microservice web application, akin to an Eventbrite clone, enabling users to create, buy and sell tickets for events.

A total of six events are exchanged among services via a message broker. The following diagrams provide a visual representation of how these events traverse through services.

<img width="854" alt="OrderCreatedEvent" src="https://github.com/AlynXZheng/EventGuide/assets/136864549/6cb403f6-a62a-4ec5-a91e-664118804c33">
<br />
<br />
<br />
<br />
<img width="867" alt="ExpirationCompleteEvent" src="https://github.com/AlynXZheng/EventGuide/assets/136864549/6935a83d-af1a-4ca7-9a34-3cafa400e119">
<br />
<br />
<br />
<br />
<img width="822" alt="OrderCancelledEvent" src="https://github.com/AlynXZheng/EventGuide/assets/136864549/ea3fd3ef-a30c-4cdb-a40a-2ebe82ddb286">
<br />
<br />
<br />
<br />
<img width="877" alt="PaymentCreatedEvent" src="https://github.com/AlynXZheng/EventGuide/assets/136864549/0f7d3733-1d11-4796-b706-c5e6d55008d5">
