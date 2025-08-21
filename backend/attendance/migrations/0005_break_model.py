# Migration to create Break model

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0004_alter_attendance_status_break'),
    ]

    operations = [
        migrations.CreateModel(
            name='Break',
            fields=[
                ('break_id', models.AutoField(primary_key=True, serialize=False)),
                ('break_start_time', models.DateTimeField()),
                ('break_end_time', models.DateTimeField(blank=True, null=True)),
                ('break_type', models.CharField(default='Regular', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('attendance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='breaks', to='attendance.attendance')),
            ],
            options={
                'ordering': ['-break_start_time'],
            },
        ),
    ]
