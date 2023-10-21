from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        for i in range(1000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        if not self.room_name:
            return

        await self.accept()
        
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)

        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        print('disconnect')
        players = cache.get(self.room_name)
        for player in players:
            if player['uuid'] == self.uuid:
                players.remove(player)
                break
        cache.set(self.room_name, players, 3600);
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
    
    async def create_player(self, data):
        players = cache.get(self.room_name)
        self.uuid = data['uuid']
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        cache.set(self.room_name, players, 3600)
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"create_player",
                'uuid':data['uuid'],
                'username':data['username'],
                'photo':data['photo'],
            }
        )

    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"move_to",
                'uuid':data['uuid'],
                'tx':data['tx'],
                'ty':data['ty']
            }
        )
    
    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"shoot_fireball",
                'uuid':data['uuid'],
                'tx':data['tx'],
                'ty':data['ty'],
                'ball_uuid':data['ball_uuid']
            }
        )
    async def shoot_arrow(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"shoot_arrow",
                'uuid':data['uuid'],
                'tx':data['tx'],
                'ty':data['ty'],
                'power':data['power'],
                'arrow_uuid':data['arrow_uuid']
            }
        )
    async def arrow_slow_speed(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event': "arrow_slow_speed",
                'uuid':data['uuid'],
                'speed':data['speed']

            }
        )
    
    async def arrow_restore_speed(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event': "arrow_restore_speed",
                'uuid':data['uuid']
            }
        )
    

    async def attack(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"attack",
                'uuid':data['uuid'],
                'attackee_uuid':data['attackee_uuid'],
                'x':data['x'],
                'y':data['y'],
                'angle':data['angle'],
                'damage':data['damage'],
                'ball_uuid':data['ball_uuid']
            }
        )

    async def flash(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event':"flash",
                'uuid':data['uuid'],
                'tx': data['tx'],
                'ty':data['ty']
            }
        )
    async def quick_move(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"quick_move",
                'uuid':data['uuid']
            }
            )
    async def chat(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "chat",
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text']
            }
        )
    async def stop_move(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"stop_move",
                'uuid': data['uuid']
            }
        )
    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "shoot_arrow":
            await self.shoot_arrow(data)
        elif event == "arrow_slow_speed":
            await self.arrow_slow_speed(data)
        elif event == "arrow_restore_speed":
            await self.arrow_restore_speed(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "flash":
            await self.flash(data)
        elif event == "quick_move":
            await self.quick_move(data)
        elif event == "chat":
            await self.chat(data)
        elif event == "stop_move":
            await self.stop_move(data)
