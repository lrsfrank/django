from django.http import JsonResponse
from game.models.player.player import Player
def getinfo(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })
