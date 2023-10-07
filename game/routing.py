from game.consumers.multiplayer.index import MultiPlayer
from django.urls import path

websocket_urlpatterns = [
        path("wss/multiplayer/", MultiPlayer.as_asgi(), name="wss_multiplayer"),
        ]
