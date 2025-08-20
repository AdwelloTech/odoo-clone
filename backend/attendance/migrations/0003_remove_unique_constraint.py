# Generated manually to remove unique constraint

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0003_alter_attendance_status'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='attendance',
            unique_together=set(),  # Remove the unique constraint
        ),
    ]
